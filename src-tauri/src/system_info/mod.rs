use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use sysinfo::System;

pub struct SystemInfoManager {
    pub system: Mutex<System>,
}

impl SystemInfoManager {
    pub fn new() -> Self {
        let mut sys = System::new_all();
        sys.refresh_all();
        Self {
            system: Mutex::new(sys),
        }
    }
}

// CPU 信息结构
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CpuInfo {
    pub name: String,
    pub cores: usize,
    pub usage: f32,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CpuDetailedInfo {
    pub name: String,
    pub vendor: String,
    pub cores: usize,
    pub threads: usize,
    pub base_frequency: String,
    pub current_frequency: String,
    pub l1_cache: String,
    pub l2_cache: String,
    pub l3_cache: String,
    pub architecture: String,
    pub usage: f32,
    pub temperature: f32,
}

// GPU 信息结构
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GpuInfo {
    pub name: String,
    pub memory: String,
    pub temperature: f32,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GpuDetailedInfo {
    pub name: String,
    pub vendor: String,
    pub memory: String,
    pub memory_type: String,
    pub driver_version: String,
    pub core_frequency: String,
    pub memory_frequency: String,
    pub temperature: f32,
    pub usage: f32,
    pub memory_usage: f32,
}

// 内存信息结构
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MemoryInfo {
    pub total: String,
    pub used: String,
    pub usage: f32,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MemoryDetailedInfo {
    pub total: String,
    pub available: String,
    pub used: String,
    pub usage_percent: f32,
    #[serde(rename = "type")]
    pub type_: String,
    pub frequency: String,
    pub slots: u32,
    pub used_slots: u32,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MemoryModule {
    pub slot: String,
    pub manufacturer: String,
    pub model: String,
    pub size: String,
    #[serde(rename = "type")]
    pub type_: String,
    pub speed: String,
}

// 磁盘信息结构
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DiskInfoItem {
    pub name: String,
    pub total: String,
    pub used: String,
    pub free: String,
    pub usage: f32,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DiskItem {
    pub name: String,
    #[serde(rename = "type")]
    pub type_: String,
    pub total: String,
    pub used: String,
    pub free: String,
    pub file_system: String,
    pub usage: f32,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DiskHealthItem {
    pub name: String,
    pub temperature: f32,
    pub health: f32,
    pub read_speed: String,
    pub write_speed: String,
    pub power_on_hours: String,
    pub power_cycle: u32,
}

// 系统信息结构
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemInfo {
    pub os: String,
    pub version: String,
    pub hostname: String,
}

// 主板信息结构
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MotherboardInfo {
    pub model: String,
    pub manufacturer: String,
    pub chipset: String,
    pub bios_version: String,
    pub bios_date: String,
    pub serial_number: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BiosInfo {
    pub vendor: String,
    pub version: String,
    pub date: String,
    pub size: String,
}

// 温度信息结构
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Temperatures {
    pub cpu: f32,
    pub gpu: f32,
    pub disk: f32,
}

// 网络信息结构
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NetworkUsage {
    pub download: String,
    pub upload: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NetworkInfo {
    pub ip: String,
    pub subnet: String,
    pub gateway: String,
    pub dns: String,
    pub mac: String,
}

// 风扇信息结构
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FanInfo {
    pub name: String,
    pub speed: u32,
    pub max_speed: u32,
    pub mode: String,
}

// 启动项结构
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StartupItem {
    pub name: String,
    pub publisher: String,
    pub path: String,
    pub enabled: bool,
}

// 驱动结构
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DriverItem {
    pub name: String,
    pub version: String,
    pub date: String,
    pub publisher: String,
    pub status: String,
}

// 扫描结果结构
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanResult {
    pub name: String,
    pub path: String,
    pub size: String,
    pub count: u64,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanResultResponse {
    pub size: String,
    pub items: Vec<ScanResult>,
}

// 性能测试结果
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BenchmarkResult {
    pub score: u32,
    pub detail: String,
}

// CPU 使用率
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CpuUsage {
    pub total: f32,
    pub cores: Vec<f32>,
}

// 内存使用率
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MemoryUsage {
    pub percentage: f32,
    pub used: String,
    pub available: String,
    pub total: String,
}

// GPU 使用率
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GpuUsage {
    pub core: f32,
    pub memory: f32,
}

// 应用设置
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub auto_start: bool,
    pub minimize_to_tray: bool,
    pub close_action: String,
    pub refresh_rate: u32,
    pub temp_warning: bool,
    pub temp_threshold: u32,
}
