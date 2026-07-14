use crate::system_info::*;
use std::fs;
use std::path::Path;
use tauri::State;
use sysinfo::System;
use wmi::{COMLibrary, WMIConnection, WMIDateTime};
use windows::Win32::System::Com::{CoInitializeEx, COINIT_MULTITHREADED};

fn get_wmi_connection() -> Result<WMIConnection, String> {
    // 先尝试让wmi crate初始化COM
    match COMLibrary::new() {
        Ok(com) => return WMIConnection::new(com).map_err(|e| e.to_string()),
        Err(_) => {
            // 如果已经以其他模式初始化，则使用assume_initialized
            let com = unsafe { COMLibrary::assume_initialized() };
            WMIConnection::new(com).map_err(|e| e.to_string())
        }
    }
}

fn format_wmi_date(date: &WMIDateTime) -> String {
    date.0.format("%Y-%m-%d").to_string()
}

// 格式化字节大小
fn format_bytes(bytes: u64) -> String {
    const KB: u64 = 1024;
    const MB: u64 = KB * 1024;
    const GB: u64 = MB * 1024;
    
    if bytes >= GB {
        format!("{:.2} GB", bytes as f64 / GB as f64)
    } else if bytes >= MB {
        format!("{:.2} MB", bytes as f64 / MB as f64)
    } else if bytes >= KB {
        format!("{:.2} KB", bytes as f64 / KB as f64)
    } else {
        format!("{} B", bytes)
    }
}

// 格式化赫兹
fn format_hertz(hertz: u64) -> String {
    const MHZ: u64 = 1_000_000;
    const GHZ: u64 = MHZ * 1000;
    
    if hertz >= GHZ {
        format!("{:.2} GHz", hertz as f64 / GHZ as f64)
    } else if hertz >= MHZ {
        format!("{:.0} MHz", hertz as f64 / MHZ as f64)
    } else {
        format!("{} Hz", hertz)
    }
}

// 保留两位小数
fn round_to_two_decimals(value: f32) -> f32 {
    (value * 100.0).round() / 100.0
}

// ==================== CPU 相关命令 ====================

#[tauri::command]
pub fn get_cpu_info(state: State<'_, SystemInfoManager>) -> Result<CpuInfo, String> {
    let mut sys = state.system.lock().map_err(|e| e.to_string())?;
    sys.refresh_cpu();
    
    let cpus = sys.cpus();
    let name = cpus.first()
        .map(|c| c.brand().to_string())
        .unwrap_or_else(|| "Unknown".to_string());
    
    let usage = round_to_two_decimals(cpus.iter()
        .map(|c| c.cpu_usage())
        .sum::<f32>() / cpus.len() as f32);
    
    Ok(CpuInfo {
        name,
        cores: cpus.len(),
        usage,
    })
}

#[tauri::command]
pub fn get_cpu_detailed_info(state: State<'_, SystemInfoManager>) -> Result<CpuDetailedInfo, String> {
    let mut sys = state.system.lock().map_err(|e| e.to_string())?;
    sys.refresh_cpu();
    
    let cpus = sys.cpus();
    let first_cpu = cpus.first();
    
    let name = first_cpu
        .map(|c| c.brand().to_string())
        .unwrap_or_else(|| "Unknown".to_string());
    
    let vendor = first_cpu
        .map(|c| c.vendor_id().to_string())
        .unwrap_or_else(|| "Unknown".to_string());
    
    let usage = round_to_two_decimals(cpus.iter()
        .map(|c| c.cpu_usage())
        .sum::<f32>() / cpus.len() as f32);
    
    let current_freq = first_cpu
        .map(|c| format_hertz(c.frequency()))
        .unwrap_or_else(|| "0 MHz".to_string());

    // 尝试从 WMI 获取 CPU 温度
    let temperature = get_cpu_temperature_from_wmi().unwrap_or(0.0);

    Ok(CpuDetailedInfo {
        name,
        vendor,
        cores: sys.physical_core_count().unwrap_or(0),
        threads: cpus.len(),
        base_frequency: "N/A".to_string(),
        current_frequency: current_freq,
        l1_cache: "N/A".to_string(),
        l2_cache: "N/A".to_string(),
        l3_cache: "N/A".to_string(),
        architecture: std::env::consts::ARCH.to_string(),
        usage,
        temperature,
    })
}

#[tauri::command]
pub fn get_cpu_usage(state: State<'_, SystemInfoManager>) -> Result<CpuUsage, String> {
    let mut sys = state.system.lock().map_err(|e| e.to_string())?;
    sys.refresh_cpu();
    
    let cpus = sys.cpus();
    let cores: Vec<f32> = cpus.iter().map(|c| round_to_two_decimals(c.cpu_usage())).collect();
    let total = round_to_two_decimals(cores.iter().sum::<f32>() / cores.len() as f32);
    
    Ok(CpuUsage { total, cores })
}

// ==================== GPU 相关命令 ====================

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32VideoController {
    name: Option<String>,
    adapter_ram: Option<u64>,
    driver_version: Option<String>,
}

#[tauri::command]
pub fn get_gpu_info() -> Result<GpuInfo, String> {
    match get_gpu_info_internal() {
        Ok(info) => Ok(info),
        Err(e) => {
            eprintln!("GPU info error: {}", e);
            Ok(GpuInfo {
                name: "无法获取".to_string(),
                memory: "N/A".to_string(),
                temperature: 0.0,
            })
        }
    }
}

fn get_gpu_info_internal() -> Result<GpuInfo, String> {
    // 先尝试 WMI，失败则 fallback 到 sysinfo
    if let Ok(wmi) = get_wmi_connection() {
        if let Ok(controllers) = wmi.query::<Win32VideoController>() {
            if let Some(controller) = controllers.into_iter().filter(|c| c.name.as_ref().map_or(false, |n| !n.contains("Microsoft"))).next() {
                let memory = controller.adapter_ram.unwrap_or(0);
                return Ok(GpuInfo {
                    name: controller.name.unwrap_or_else(|| "Unknown".to_string()),
                    memory: format_bytes(memory),
                    temperature: 0.0,
                });
            }
        }
    }
    
    // WMI 失败，使用 sysinfo fallback
    let sys = System::new_all();
    let gpu_name = sys.gpus().first()
        .map(|g| g.name().to_string())
        .unwrap_or_else(|| "未检测到".to_string());
    
    Ok(GpuInfo {
        name: gpu_name,
        memory: "N/A".to_string(),
        temperature: 0.0,
    })
}

#[tauri::command]
pub fn get_gpu_detailed_info() -> Result<GpuDetailedInfo, String> {
    match get_gpu_detailed_info_internal() {
        Ok(info) => Ok(info),
        Err(e) => {
            eprintln!("GPU detailed info error: {}", e);
            Ok(GpuDetailedInfo {
                name: "无法获取".to_string(),
                vendor: "N/A".to_string(),
                memory: "N/A".to_string(),
                memory_type: "N/A".to_string(),
                driver_version: "N/A".to_string(),
                core_frequency: "N/A".to_string(),
                memory_frequency: "N/A".to_string(),
                temperature: 0.0,
                usage: 0.0,
                memory_usage: 0.0,
            })
        }
    }
}

fn get_gpu_detailed_info_internal() -> Result<GpuDetailedInfo, String> {
    // 先尝试 WMI，失败则 fallback 到 sysinfo
    if let Ok(wmi) = get_wmi_connection() {
        if let Ok(controllers) = wmi.query::<Win32VideoController>() {
            if let Some(controller) = controllers.into_iter().filter(|c| c.name.as_ref().map_or(false, |n| !n.contains("Microsoft"))).next() {
                let memory = controller.adapter_ram.unwrap_or(0);
                return Ok(GpuDetailedInfo {
                    name: controller.name.clone().unwrap_or_else(|| "Unknown".to_string()),
                    vendor: "N/A".to_string(),
                    memory: format_bytes(memory),
                    memory_type: "N/A".to_string(),
                    driver_version: controller.driver_version.clone().unwrap_or_else(|| "N/A".to_string()),
                    core_frequency: "N/A".to_string(),
                    memory_frequency: "N/A".to_string(),
                    temperature: 0.0,
                    usage: 0.0,
                    memory_usage: 0.0,
                });
            }
        }
    }
    
    // WMI 失败，使用 sysinfo fallback
    let sys = System::new_all();
    let gpu_name = sys.gpus().first()
        .map(|g| g.name().to_string())
        .unwrap_or_else(|| "未检测到".to_string());
    
    Ok(GpuDetailedInfo {
        name: gpu_name,
        vendor: "N/A".to_string(),
        memory: "N/A".to_string(),
        memory_type: "N/A".to_string(),
        driver_version: "N/A".to_string(),
        core_frequency: "N/A".to_string(),
        memory_frequency: "N/A".to_string(),
        temperature: 0.0,
        usage: 0.0,
        memory_usage: 0.0,
    })
}

#[tauri::command]
pub fn get_gpu_usage() -> Result<GpuUsage, String> {
    Ok(GpuUsage {
        core: 0.0,
        memory: 0.0,
    })
}

// ==================== 内存相关命令 ====================

#[tauri::command]
pub fn get_memory_info(state: State<'_, SystemInfoManager>) -> Result<MemoryInfo, String> {
    let sys = state.system.lock().map_err(|e| e.to_string())?;
    
    let total = sys.total_memory();
    let used = sys.used_memory();
    let usage = round_to_two_decimals((used as f64 / total as f64 * 100.0) as f32);
    
    Ok(MemoryInfo {
        total: format_bytes(total),
        used: format_bytes(used),
        usage,
    })
}

#[tauri::command]
pub fn get_memory_detailed_info(state: State<'_, SystemInfoManager>) -> Result<MemoryDetailedInfo, String> {
    let sys = state.system.lock().map_err(|e| e.to_string())?;

    let total = sys.total_memory();
    let available = sys.available_memory();
    let used = total - available;
    let usage_percent = round_to_two_decimals((used as f64 / total as f64 * 100.0) as f32);

    // 从 WMI 获取内存详细信息
    let (mem_type, frequency, slots, used_slots) = match get_memory_details_from_wmi() {
        Ok(details) => details,
        Err(e) => {
            eprintln!("Memory details WMI error: {}", e);
            ("N/A".to_string(), "N/A".to_string(), 0, 0)
        }
    };

    Ok(MemoryDetailedInfo {
        total: format_bytes(total),
        available: format_bytes(available),
        used: format_bytes(used),
        usage_percent,
        type_: mem_type,
        frequency,
        slots,
        used_slots,
    })
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32PhysicalMemoryArray {
    memory_devices: Option<u32>,
}

fn get_memory_details_from_wmi() -> Result<(String, String, u32, u32), String> {
    let wmi = get_wmi_connection()?;

    let memories: Vec<Win32PhysicalMemory> = wmi.query().map_err(|e| e.to_string())?;
    let used_slots = memories.len() as u32;

    let mem_type = memories.first()
        .and_then(|m| m.memory_type)
        .map(|t| match t {
            20 => "DDR".to_string(),
            21 => "DDR2".to_string(),
            24 => "DDR3".to_string(),
            26 => "DDR4".to_string(),
            _ => format!("Type-{}", t),
        })
        .unwrap_or_else(|| "N/A".to_string());

    let frequency = memories.first()
        .and_then(|m| m.speed)
        .map(|s| format!("{} MHz", s))
        .unwrap_or_else(|| "N/A".to_string());

    let slots = if let Ok(arrays) = wmi.query::<Win32PhysicalMemoryArray>() {
        arrays.iter().filter_map(|a| a.memory_devices).sum::<u32>()
    } else {
        used_slots
    };

    Ok((mem_type, frequency, slots, used_slots))
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32PhysicalMemory {
    bank_label: Option<String>,
    manufacturer: Option<String>,
    part_number: Option<String>,
    capacity: Option<u64>,
    memory_type: Option<u32>,
    speed: Option<u32>,
}

#[tauri::command]
pub fn get_memory_modules() -> Result<Vec<MemoryModule>, String> {
    match get_memory_modules_internal() {
        Ok(modules) => Ok(modules),
        Err(e) => {
            eprintln!("Memory modules error: {}", e);
            Ok(vec![MemoryModule {
                slot: "无法获取".to_string(),
                manufacturer: "N/A".to_string(),
                model: "N/A".to_string(),
                size: "N/A".to_string(),
                type_: "N/A".to_string(),
                speed: "N/A".to_string(),
            }])
        }
    }
}

fn get_memory_modules_internal() -> Result<Vec<MemoryModule>, String> {
    let wmi = get_wmi_connection()?;
    
    let memories: Vec<Win32PhysicalMemory> = wmi.query().map_err(|e| e.to_string())?;
    
    let mut modules = Vec::new();
    for mem in memories {
        let mem_type = match mem.memory_type {
            Some(0) => "Unknown".to_string(),
            Some(1) => "Other".to_string(),
            Some(2) => "DRAM".to_string(),
            Some(3) => "Synchronous DRAM".to_string(),
            Some(4) => "Cache DRAM".to_string(),
            Some(5) => "EDO".to_string(),
            Some(6) => "EDRAM".to_string(),
            Some(7) => "VRAM".to_string(),
            Some(8) => "SRAM".to_string(),
            Some(9) => "RAM".to_string(),
            Some(10) => "ROM".to_string(),
            Some(11) => "Flash".to_string(),
            Some(12) => "EEPROM".to_string(),
            Some(13) => "FEPROM".to_string(),
            Some(14) => "EPROM".to_string(),
            Some(15) => "CDRAM".to_string(),
            Some(16) => "3DRAM".to_string(),
            Some(17) => "SDRAM".to_string(),
            Some(18) => "SGRAM".to_string(),
            Some(19) => "RDRAM".to_string(),
            Some(20) => "DDR".to_string(),
            Some(21) => "DDR2".to_string(),
            Some(22) => "DDR2 FB-DIMM".to_string(),
            Some(24) => "DDR3".to_string(),
            Some(26) => "DDR4".to_string(),
            Some(_) => "N/A".to_string(),
            None => "N/A".to_string(),
        };
        
        modules.push(MemoryModule {
            slot: mem.bank_label.unwrap_or_else(|| "N/A".to_string()),
            manufacturer: mem.manufacturer.unwrap_or_else(|| "Unknown".to_string()),
            model: mem.part_number.unwrap_or_else(|| "N/A".to_string()),
            size: format_bytes(mem.capacity.unwrap_or(0)),
            type_: mem_type,
            speed: mem.speed.map(|s| format!("{} MHz", s)).unwrap_or_else(|| "N/A".to_string()),
        });
    }
    
    if modules.is_empty() {
        Ok(vec![MemoryModule {
            slot: "N/A".to_string(),
            manufacturer: "Unknown".to_string(),
            model: "N/A".to_string(),
            size: "0 GB".to_string(),
            type_: "N/A".to_string(),
            speed: "N/A".to_string(),
        }])
    } else {
        Ok(modules)
    }
}

#[tauri::command]
pub fn get_memory_usage(state: State<'_, SystemInfoManager>) -> Result<MemoryUsage, String> {
    let sys = state.system.lock().map_err(|e| e.to_string())?;
    
    let total = sys.total_memory();
    let available = sys.available_memory();
    let used = total - available;
    let percentage = round_to_two_decimals((used as f64 / total as f64 * 100.0) as f32);
    
    Ok(MemoryUsage {
        percentage,
        used: format_bytes(used),
        available: format_bytes(available),
        total: format_bytes(total),
    })
}

// ==================== 磁盘相关命令 ====================

#[tauri::command]
pub fn get_disk_info(_state: State<'_, SystemInfoManager>) -> Result<Vec<DiskInfoItem>, String> {
    match get_disk_info_internal() {
        Ok(disks) => Ok(disks),
        Err(e) => {
            eprintln!("Disk info error: {}", e);
            Ok(vec![DiskInfoItem {
                name: "无法获取".to_string(),
                total: "N/A".to_string(),
                used: "N/A".to_string(),
                free: "N/A".to_string(),
                usage: 0.0,
            }])
        }
    }
}

fn get_disk_info_internal() -> Result<Vec<DiskInfoItem>, String> {
    let wmi = get_wmi_connection()?;
    
    let disks: Vec<Win32LogicalDisk> = wmi.query().map_err(|e| e.to_string())?;
    
    let mut result = Vec::new();
    for disk in disks {
        if let (Some(size), Some(free)) = (disk.size, disk.free_space) {
            if size > 0 {
                let used = size.saturating_sub(free);
                let usage = round_to_two_decimals((used as f64 / size as f64 * 100.0) as f32);
                
                result.push(DiskInfoItem {
                    name: disk.device_id,
                    total: format_bytes(size),
                    used: format_bytes(used),
                    free: format_bytes(free),
                    usage,
                });
            }
        }
    }
    
    Ok(result)
}

#[tauri::command]
pub fn get_disk_list(_state: State<'_, SystemInfoManager>) -> Result<Vec<DiskItem>, String> {
    match get_disk_list_internal() {
        Ok(disks) => Ok(disks),
        Err(e) => {
            eprintln!("Disk list error: {}", e);
            Ok(vec![DiskItem {
                name: "无法获取".to_string(),
                type_: "N/A".to_string(),
                total: "N/A".to_string(),
                used: "N/A".to_string(),
                free: "N/A".to_string(),
                file_system: "N/A".to_string(),
                usage: 0.0,
            }])
        }
    }
}

fn get_disk_list_internal() -> Result<Vec<DiskItem>, String> {
    let wmi = get_wmi_connection()?;
    
    let disks: Vec<Win32LogicalDisk> = wmi.query().map_err(|e| e.to_string())?;
    
    let mut result = Vec::new();
    for disk in disks {
        if let (Some(size), Some(free)) = (disk.size, disk.free_space) {
            if size > 0 {
                let used = size.saturating_sub(free);
                let usage = round_to_two_decimals((used as f64 / size as f64 * 100.0) as f32);
                
                result.push(DiskItem {
                    name: disk.device_id,
                    type_: "N/A".to_string(),
                    total: format_bytes(size),
                    used: format_bytes(used),
                    free: format_bytes(free),
                    file_system: disk.filesystem.unwrap_or_else(|| "N/A".to_string()),
                    usage,
                });
            }
        }
    }
    
    Ok(result)
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32DiskDrive {
    device_id: String,
    model: String,
    media_type: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32LogicalDisk {
    device_id: String,
    filesystem: Option<String>,
    size: Option<u64>,
    free_space: Option<u64>,
}

#[tauri::command]
pub fn get_disk_health() -> Result<Vec<DiskHealthItem>, String> {
    Ok(vec![
        DiskHealthItem {
            name: "N/A".to_string(),
            temperature: 0.0,
            health: 0.0,
            read_speed: "N/A".to_string(),
            write_speed: "N/A".to_string(),
            power_on_hours: "N/A".to_string(),
            power_cycle: 0,
        },
    ])
}

// ==================== 系统信息命令 ====================

#[tauri::command]
pub fn get_system_info(state: State<'_, SystemInfoManager>) -> Result<SystemInfo, String> {
    let sys = state.system.lock().map_err(|e| e.to_string())?;
    
    Ok(SystemInfo {
        os: System::name().unwrap_or_else(|| "Unknown".to_string()),
        version: System::os_version().unwrap_or_else(|| "Unknown".to_string()),
        hostname: System::host_name().unwrap_or_else(|| "Unknown".to_string()),
    })
}

// ==================== 主板信息命令 ====================

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32BaseBoard {
    product: Option<String>,
    manufacturer: Option<String>,
    serial_number: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32Bios {
    manufacturer: Option<String>,
    version: Option<String>,
    release_date: Option<WMIDateTime>,
    bios_version: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32ComputerSystemProduct {
    name: Option<String>,
    vendor: Option<String>,
}

#[tauri::command]
pub fn get_motherboard_info() -> Result<MotherboardInfo, String> {
    match get_motherboard_info_internal() {
        Ok(info) => Ok(info),
        Err(e) => {
            eprintln!("Motherboard info error: {}", e);
            Ok(MotherboardInfo {
                model: "无法获取".to_string(),
                manufacturer: "N/A".to_string(),
                chipset: "N/A".to_string(),
                bios_version: "N/A".to_string(),
                bios_date: "N/A".to_string(),
                serial_number: "N/A".to_string(),
            })
        }
    }
}

fn get_motherboard_info_internal() -> Result<MotherboardInfo, String> {
    let wmi = get_wmi_connection()?;
    
    let baseboards: Vec<Win32BaseBoard> = wmi.query().map_err(|e| e.to_string())?;
    let bioses: Vec<Win32Bios> = wmi.query().map_err(|e| e.to_string())?;
    
    let baseboard = baseboards.first();
    let bios = bioses.first();
    
    Ok(MotherboardInfo {
        model: baseboard.and_then(|b| b.product.clone()).unwrap_or_else(|| "Unknown".to_string()),
        manufacturer: baseboard.and_then(|b| b.manufacturer.clone()).unwrap_or_else(|| "Unknown".to_string()),
        chipset: "N/A".to_string(),
        bios_version: bios.and_then(|b| b.version.clone()).unwrap_or_else(|| "N/A".to_string()),
        bios_date: bios.and_then(|b| b.release_date.as_ref().map(|d| format_wmi_date(d))).unwrap_or_else(|| "N/A".to_string()),
        serial_number: baseboard.and_then(|b| b.serial_number.clone()).unwrap_or_else(|| "N/A".to_string()),
    })
}

#[tauri::command]
pub fn get_bios_info() -> Result<BiosInfo, String> {
    match get_bios_info_internal() {
        Ok(info) => Ok(info),
        Err(e) => {
            eprintln!("BIOS info error: {}", e);
            Ok(BiosInfo {
                vendor: "无法获取".to_string(),
                version: "N/A".to_string(),
                date: "N/A".to_string(),
                size: "N/A".to_string(),
            })
        }
    }
}

fn get_bios_info_internal() -> Result<BiosInfo, String> {
    let wmi = get_wmi_connection()?;
    
    let bioses: Vec<Win32Bios> = wmi.query().map_err(|e| e.to_string())?;
    
    if let Some(bios) = bioses.first() {
        Ok(BiosInfo {
            vendor: bios.manufacturer.clone().unwrap_or_else(|| "Unknown".to_string()),
            version: bios.version.clone().unwrap_or_else(|| "N/A".to_string()),
            date: bios.release_date.as_ref().map(|d| format_wmi_date(d)).unwrap_or_else(|| "N/A".to_string()),
            size: "N/A".to_string(),
        })
    } else {
        Ok(BiosInfo {
            vendor: "Unknown".to_string(),
            version: "N/A".to_string(),
            date: "N/A".to_string(),
            size: "N/A".to_string(),
        })
    }
}

// ==================== 监控相关命令 ====================

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "PascalCase")]
struct MSAcpiThermalZoneTemperature {
    current_temperature: Option<i32>,
}

// 从 WMI 获取 CPU 温度
fn get_cpu_temperature_from_wmi() -> Result<f32, String> {
    let wmi = get_wmi_connection()?;
    let zones: Vec<MSAcpiThermalZoneTemperature> = wmi.query().map_err(|e| e.to_string())?;
    for zone in zones {
        if let Some(temp) = zone.current_temperature {
            return Ok((temp - 2732) as f32 / 10.0);
        }
    }
    Err("No thermal zone found".to_string())
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32Fan {
    name: Option<String>,
    current_speed: Option<u32>,
    max_speed: Option<u32>,
}

#[tauri::command]
pub fn get_temperatures() -> Result<Temperatures, String> {
    match get_temperatures_internal() {
        Ok(temp) => Ok(temp),
        Err(e) => {
            eprintln!("Temperatures error: {}", e);
            Ok(Temperatures {
                cpu: 0.0,
                gpu: 0.0,
                disk: 0.0,
            })
        }
    }
}

fn get_temperatures_internal() -> Result<Temperatures, String> {
    let wmi = get_wmi_connection()?;
    
    let zones: Vec<MSAcpiThermalZoneTemperature> = wmi.query().map_err(|e| e.to_string())?;
    
    let mut cpu_temp = 0.0;
    let mut gpu_temp = 0.0;
    let mut disk_temp = 0.0;
    
    for zone in zones {
        if let Some(temp) = zone.current_temperature {
            let celsius = (temp - 2732) as f32 / 10.0;
            if cpu_temp == 0.0 {
                cpu_temp = celsius;
            } else if gpu_temp == 0.0 {
                gpu_temp = celsius;
            } else if disk_temp == 0.0 {
                disk_temp = celsius;
                break;
            }
        }
    }
    
    Ok(Temperatures {
        cpu: if cpu_temp > 0.0 { cpu_temp } else { 0.0 },
        gpu: if gpu_temp > 0.0 { gpu_temp } else { 0.0 },
        disk: if disk_temp > 0.0 { disk_temp } else { 0.0 },
    })
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32NetworkAdapterConfiguration {
    ip_address: Option<Vec<String>>,
    ip_subnet: Option<Vec<String>>,
    default_ip_gateway: Option<Vec<String>>,
    dnsserver_search_order: Option<Vec<String>>,
    mac_address: Option<String>,
    ip_enabled: bool,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32PerfRawDataTcpipNetworkInterface {
    bytes_received_per_sec: Option<u64>,
    bytes_sent_per_sec: Option<u64>,
}

#[tauri::command]
pub fn get_network_usage(_state: State<'_, SystemInfoManager>) -> Result<NetworkUsage, String> {
    match get_network_usage_internal() {
        Ok(usage) => Ok(usage),
        Err(e) => {
            eprintln!("Network usage error: {}", e);
            Ok(NetworkUsage {
                download: "无法获取".to_string(),
                upload: "N/A".to_string(),
            })
        }
    }
}

fn get_network_usage_internal() -> Result<NetworkUsage, String> {
    let wmi = get_wmi_connection()?;
    
    let interfaces: Vec<Win32PerfRawDataTcpipNetworkInterface> = wmi.query().map_err(|e| e.to_string())?;
    
    let mut total_down = 0u64;
    let mut total_up = 0u64;
    
    for iface in interfaces {
        total_down += iface.bytes_received_per_sec.unwrap_or(0);
        total_up += iface.bytes_sent_per_sec.unwrap_or(0);
    }
    
    Ok(NetworkUsage {
        download: format_bytes(total_down),
        upload: format_bytes(total_up),
    })
}

#[tauri::command]
pub fn get_network_speed(_state: State<'_, SystemInfoManager>) -> Result<NetworkUsage, String> {
    match get_network_speed_internal() {
        Ok(speed) => Ok(speed),
        Err(e) => {
            eprintln!("Network speed error: {}", e);
            Ok(NetworkUsage {
                download: "无法获取".to_string(),
                upload: "N/A".to_string(),
            })
        }
    }
}

fn get_network_speed_internal() -> Result<NetworkUsage, String> {
    let wmi = get_wmi_connection()?;
    
    let interfaces: Vec<Win32PerfRawDataTcpipNetworkInterface> = wmi.query().map_err(|e| e.to_string())?;
    
    let mut total_down = 0u64;
    let mut total_up = 0u64;
    
    for iface in interfaces {
        total_down += iface.bytes_received_per_sec.unwrap_or(0);
        total_up += iface.bytes_sent_per_sec.unwrap_or(0);
    }
    
    Ok(NetworkUsage {
        download: format_bytes(total_down),
        upload: format_bytes(total_up),
    })
}

#[tauri::command]
pub fn get_fan_info() -> Result<Vec<FanInfo>, String> {
    match get_fan_info_internal() {
        Ok(fans) => Ok(fans),
        Err(e) => {
            eprintln!("Fan info error: {}", e);
            Ok(vec![FanInfo {
                name: "无法获取".to_string(),
                speed: 0,
                max_speed: 0,
                mode: "N/A".to_string(),
            }])
        }
    }
}

fn get_fan_info_internal() -> Result<Vec<FanInfo>, String> {
    let wmi = get_wmi_connection()?;
    
    let fans: Vec<Win32Fan> = wmi.query().map_err(|e| e.to_string())?;
    
    let mut result = Vec::new();
    for fan in fans {
        result.push(FanInfo {
            name: fan.name.unwrap_or_else(|| "Unknown Fan".to_string()),
            speed: fan.current_speed.unwrap_or(0),
            max_speed: fan.max_speed.unwrap_or(0),
            mode: "Auto".to_string(),
        });
    }
    
    if result.is_empty() {
        Ok(vec![FanInfo {
            name: "N/A".to_string(),
            speed: 0,
            max_speed: 0,
            mode: "N/A".to_string(),
        }])
    } else {
        Ok(result)
    }
}

// ==================== 工具相关命令 ====================

#[tauri::command]
pub fn scan_cache() -> Result<ScanResultResponse, String> {
    let mut items = Vec::new();
    let mut total_size = 0u64;
    
    // 扫描 Windows 临时文件
    if let Ok(temp_path) = std::env::var("TEMP") {
        if let Ok(entries) = fs::read_dir(&temp_path) {
            let mut count = 0u64;
            let mut size = 0u64;
            
            for entry in entries.flatten() {
                if let Ok(metadata) = entry.metadata() {
                    if metadata.is_file() {
                        size += metadata.len();
                        count += 1;
                    }
                }
            }
            
            total_size += size;
            items.push(ScanResult {
                name: "系统临时文件".to_string(),
                path: temp_path,
                size: format_bytes(size),
                count,
            });
        }
    }
    
    Ok(ScanResultResponse {
        size: format_bytes(total_size),
        items,
    })
}

fn scan_directory(path: &str, name: &str) -> Option<ScanResult> {
    let path = Path::new(path);
    if !path.exists() || !path.is_dir() {
        return None;
    }
    
    let mut size = 0u64;
    let mut count = 0u64;
    
    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                if metadata.is_file() {
                    size += metadata.len();
                    count += 1;
                }
            }
        }
    }
    
    if size > 0 {
        Some(ScanResult {
            name: name.to_string(),
            path: path.to_string_lossy().to_string(),
            size: format_bytes(size),
            count,
        })
    } else {
        None
    }
}

#[tauri::command]
pub fn scan_temp() -> Result<ScanResultResponse, String> {
    let mut items = Vec::new();
    let mut total_size = 0u64;
    
    if let Some(result) = scan_directory("C:\\Windows\\Temp", "Windows临时文件") {
        total_size += result.size.parse::<u64>().unwrap_or(0);
        items.push(result);
    }
    
    if let Ok(temp_path) = std::env::var("TEMP") {
        if let Some(result) = scan_directory(&temp_path, "用户临时文件") {
            total_size += result.size.parse::<u64>().unwrap_or(0);
            items.push(result);
        }
    }
    
    if let Ok(temp_path) = std::env::var("TMP") {
        if let Some(result) = scan_directory(&temp_path, "系统临时文件") {
            total_size += result.size.parse::<u64>().unwrap_or(0);
            items.push(result);
        }
    }
    
    Ok(ScanResultResponse {
        size: format_bytes(total_size),
        items,
    })
}

#[tauri::command]
pub fn scan_logs() -> Result<ScanResultResponse, String> {
    let mut items = Vec::new();
    let mut total_size = 0u64;
    
    if let Some(result) = scan_directory("C:\\Windows\\Logs", "系统日志") {
        total_size += result.size.parse::<u64>().unwrap_or(0);
        items.push(result);
    }
    
    if let Some(result) = scan_directory("C:\\Windows\\System32\\winevt\\Logs", "事件日志") {
        total_size += result.size.parse::<u64>().unwrap_or(0);
        items.push(result);
    }
    
    Ok(ScanResultResponse {
        size: format_bytes(total_size),
        items,
    })
}

#[tauri::command]
pub fn scan_recycle() -> Result<ScanResultResponse, String> {
    let mut items = Vec::new();
    let mut total_size = 0u64;
    
    if let Some(result) = scan_directory("C:\\$Recycle.Bin", "回收站") {
        total_size += result.size.parse::<u64>().unwrap_or(0);
        items.push(result);
    }
    
    Ok(ScanResultResponse {
        size: format_bytes(total_size),
        items,
    })
}

#[tauri::command]
pub fn scan_browser() -> Result<ScanResultResponse, String> {
    let mut items = Vec::new();
    let mut total_size = 0u64;
    
    if let Ok(user_profile) = std::env::var("USERPROFILE") {
        let chrome_cache = format!("{}\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Cache", user_profile);
        if let Some(result) = scan_directory(&chrome_cache, "Chrome缓存") {
            total_size += result.size.parse::<u64>().unwrap_or(0);
            items.push(result);
        }
        
        let edge_cache = format!("{}\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Cache", user_profile);
        if let Some(result) = scan_directory(&edge_cache, "Edge缓存") {
            total_size += result.size.parse::<u64>().unwrap_or(0);
            items.push(result);
        }
        
        let firefox_cache = format!("{}\\AppData\\Local\\Mozilla\\Firefox\\Profiles", user_profile);
        if let Some(result) = scan_directory(&firefox_cache, "Firefox缓存") {
            total_size += result.size.parse::<u64>().unwrap_or(0);
            items.push(result);
        }
    }
    
    Ok(ScanResultResponse {
        size: format_bytes(total_size),
        items,
    })
}

#[tauri::command]
pub fn scan_all() -> Result<ScanResultResponse, String> {
    let mut items = Vec::new();
    let mut total_size = 0u64;
    
    if let Ok(temp_result) = scan_temp() {
        total_size += temp_result.size.parse::<u64>().unwrap_or(0);
        items.extend(temp_result.items);
    }
    
    if let Ok(log_result) = scan_logs() {
        total_size += log_result.size.parse::<u64>().unwrap_or(0);
        items.extend(log_result.items);
    }
    
    if let Ok(recycle_result) = scan_recycle() {
        total_size += recycle_result.size.parse::<u64>().unwrap_or(0);
        items.extend(recycle_result.items);
    }
    
    if let Ok(browser_result) = scan_browser() {
        total_size += browser_result.size.parse::<u64>().unwrap_or(0);
        items.extend(browser_result.items);
    }
    
    if let Ok(cache_result) = scan_cache() {
        total_size += cache_result.size.parse::<u64>().unwrap_or(0);
        items.extend(cache_result.items);
    }
    
    Ok(ScanResultResponse {
        size: format_bytes(total_size),
        items,
    })
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32StartupCommand {
    name: Option<String>,
    command: Option<String>,
    location: Option<String>,
    user: Option<String>,
}

#[tauri::command]
pub fn get_startup_items() -> Result<Vec<StartupItem>, String> {
    match get_startup_items_internal() {
        Ok(items) => Ok(items),
        Err(e) => {
            eprintln!("Startup items error: {}", e);
            Ok(vec![StartupItem {
                name: "无法获取".to_string(),
                publisher: "N/A".to_string(),
                path: "N/A".to_string(),
                enabled: false,
            }])
        }
    }
}

fn get_startup_items_internal() -> Result<Vec<StartupItem>, String> {
    let wmi = get_wmi_connection()?;
    
    let commands: Vec<Win32StartupCommand> = wmi.query().map_err(|e| e.to_string())?;
    
    let mut items = Vec::new();
    for cmd in commands {
        if let Some(name) = cmd.name {
            items.push(StartupItem {
                name,
                publisher: "N/A".to_string(),
                path: cmd.command.unwrap_or_else(|| "N/A".to_string()),
                enabled: true,
            });
        }
    }
    
    if items.is_empty() {
        Ok(vec![StartupItem {
            name: "N/A".to_string(),
            publisher: "N/A".to_string(),
            path: "N/A".to_string(),
            enabled: false,
        }])
    } else {
        Ok(items)
    }
}

#[tauri::command]
pub fn toggle_startup(name: String, enabled: bool) -> Result<(), String> {
    println!("Toggle startup: {} -> {}", name, enabled);
    Ok(())
}

#[tauri::command]
pub fn delete_startup(name: String) -> Result<(), String> {
    println!("Delete startup: {}", name);
    Ok(())
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Win32PnPSignedDriver {
    device_name: Option<String>,
    driver_version: Option<String>,
    driver_date: Option<WMIDateTime>,
    manufacturer: Option<String>,
    device_status: Option<u32>,
}

#[tauri::command]
pub fn scan_drivers() -> Result<Vec<DriverItem>, String> {
    match scan_drivers_internal() {
        Ok(drivers) => Ok(drivers),
        Err(e) => {
            eprintln!("Drivers scan error: {}", e);
            Ok(vec![DriverItem {
                name: "无法获取".to_string(),
                version: "N/A".to_string(),
                date: "N/A".to_string(),
                publisher: "N/A".to_string(),
                status: "N/A".to_string(),
            }])
        }
    }
}

fn scan_drivers_internal() -> Result<Vec<DriverItem>, String> {
    let wmi = get_wmi_connection()?;
    
    let drivers: Vec<Win32PnPSignedDriver> = wmi.query().map_err(|e| e.to_string())?;
    
    let mut items = Vec::new();
    for driver in drivers {
        if let Some(name) = driver.device_name {
            items.push(DriverItem {
                name,
                version: driver.driver_version.unwrap_or_else(|| "N/A".to_string()),
                date: driver.driver_date.as_ref().map(|d| format_wmi_date(d)).unwrap_or_else(|| "N/A".to_string()),
                publisher: driver.manufacturer.unwrap_or_else(|| "N/A".to_string()),
                status: if driver.device_status == Some(0) { "正常".to_string() } else { "未知".to_string() },
            });
        }
    }
    
    if items.is_empty() {
        Ok(vec![DriverItem {
            name: "N/A".to_string(),
            version: "N/A".to_string(),
            date: "N/A".to_string(),
            publisher: "N/A".to_string(),
            status: "N/A".to_string(),
        }])
    } else {
        Ok(items)
    }
}

#[tauri::command]
pub fn update_driver(name: String) -> Result<(), String> {
    println!("Update driver: {}", name);
    Ok(())
}

#[tauri::command]
pub fn get_network_info() -> Result<NetworkInfo, String> {
    match get_network_info_internal() {
        Ok(info) => Ok(info),
        Err(e) => {
            eprintln!("Network info error: {}", e);
            Ok(NetworkInfo {
                ip: "无法获取".to_string(),
                subnet: "N/A".to_string(),
                gateway: "N/A".to_string(),
                dns: "N/A".to_string(),
                mac: "N/A".to_string(),
            })
        }
    }
}

fn get_network_info_internal() -> Result<NetworkInfo, String> {
    let wmi = get_wmi_connection()?;
    
    let configs: Vec<Win32NetworkAdapterConfiguration> = wmi.query().map_err(|e| e.to_string())?;
    
    if let Some(config) = configs.into_iter().find(|c| c.ip_enabled) {
        Ok(NetworkInfo {
            ip: config.ip_address.and_then(|ips| ips.first().cloned()).unwrap_or_else(|| "N/A".to_string()),
            subnet: config.ip_subnet.and_then(|subs| subs.first().cloned()).unwrap_or_else(|| "N/A".to_string()),
            gateway: config.default_ip_gateway.and_then(|gws| gws.first().cloned()).unwrap_or_else(|| "N/A".to_string()),
            dns: config.dnsserver_search_order.map(|dns| dns.join(", ")).unwrap_or_else(|| "N/A".to_string()),
            mac: config.mac_address.unwrap_or_else(|| "N/A".to_string()),
        })
    } else {
        Ok(NetworkInfo {
            ip: "N/A".to_string(),
            subnet: "N/A".to_string(),
            gateway: "N/A".to_string(),
            dns: "N/A".to_string(),
            mac: "N/A".to_string(),
        })
    }
}

#[tauri::command]
pub fn run_ping(host: String) -> Result<String, String> {
    use std::process::Command;
    let output = Command::new("cmd")
        .args(["/c", "ping", "-n", "1", "-w", "1000", &host])
        .output()
        .map_err(|e| e.to_string())?;
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

// ==================== 性能测试命令 ====================

#[tauri::command]
pub fn run_cpu_benchmark() -> Result<BenchmarkResult, String> {
    use std::time::Instant;
    let start = Instant::now();
    let mut sum: f64 = 0.0;
    for i in 1..=10_000_000 {
        sum += (i as f64).sqrt();
    }
    let elapsed = start.elapsed().as_millis() as u64;
    let score = if elapsed > 0 { 1_000_000_000 / elapsed } else { 0 };
    Ok(BenchmarkResult {
        score: score as u32,
        detail: format!("耗时: {} ms", elapsed),
    })
}

#[tauri::command]
pub fn run_gpu_benchmark() -> Result<BenchmarkResult, String> {
    // GPU 真实性能测试较复杂，当前使用CPU模拟计算作为参考
    use std::time::Instant;
    let start = Instant::now();
    let mut sum: f64 = 0.0;
    for i in 1..=5_000_000 {
        sum += (i as f64).sin() * (i as f64).cos();
    }
    let elapsed = start.elapsed().as_millis() as u64;
    let score = if elapsed > 0 { 500_000_000 / elapsed } else { 0 };
    Ok(BenchmarkResult {
        score: score as u32,
        detail: format!("耗时: {} ms", elapsed),
    })
}

#[tauri::command]
pub fn run_disk_benchmark() -> Result<BenchmarkResult, String> {
    use std::fs;
    use std::time::Instant;
    
    let temp_dir = std::env::temp_dir();
    let test_file = temp_dir.join("pc_tools_disk_benchmark.tmp");
    let data = vec![0u8; 1024 * 1024 * 10]; // 10MB
    
    // 写入测试
    let write_start = Instant::now();
    fs::write(&test_file, &data).map_err(|e| e.to_string())?;
    let write_elapsed = write_start.elapsed().as_millis() as u64;
    
    // 读取测试
    let read_start = Instant::now();
    let _ = fs::read(&test_file).map_err(|e| e.to_string())?;
    let read_elapsed = read_start.elapsed().as_millis() as u64;
    
    let _ = fs::remove_file(&test_file);
    
    let write_speed = if write_elapsed > 0 { (10 * 1000) / write_elapsed } else { 0 };
    let read_speed = if read_elapsed > 0 { (10 * 1000) / read_elapsed } else { 0 };
    let score = ((write_speed + read_speed) / 2) as u32;
    
    Ok(BenchmarkResult {
        score,
        detail: format!("读取: {} MB/s, 写入: {} MB/s", read_speed, write_speed),
    })
}

// ==================== 设置相关命令 ====================

fn get_settings_path() -> Result<std::path::PathBuf, String> {
    let app_data = std::env::var("APPDATA").map_err(|_| "无法获取APPDATA目录")?;
    let app_dir = std::path::PathBuf::from(app_data).join("pc-tools");
    std::fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
    Ok(app_dir.join("settings.json"))
}

#[tauri::command]
pub fn get_settings() -> Result<AppSettings, String> {
    let path = get_settings_path()?;
    if path.exists() {
        let content = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
        serde_json::from_str(&content).map_err(|e| e.to_string())
    } else {
        let default = AppSettings {
            auto_start: false,
            minimize_to_tray: true,
            close_action: "minimize".to_string(),
            refresh_rate: 2000,
            temp_warning: true,
            temp_threshold: 80,
        };
        let content = serde_json::to_string_pretty(&default).map_err(|e| e.to_string())?;
        std::fs::write(&path, content).map_err(|e| e.to_string())?;
        Ok(default)
    }
}

#[tauri::command]
pub fn save_settings(settings: AppSettings) -> Result<(), String> {
    let path = get_settings_path()?;
    let content = serde_json::to_string_pretty(&settings).map_err(|e| e.to_string())?;
    std::fs::write(&path, content).map_err(|e| e.to_string())
}
