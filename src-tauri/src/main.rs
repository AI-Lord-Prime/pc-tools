// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use pc_tools::{commands::*, system_info::SystemInfoManager};

fn main() {
    // 初始化系统信息管理器
    let system_manager = SystemInfoManager::new();

    tauri::Builder::default()
        .manage(system_manager)
        .invoke_handler(tauri::generate_handler![
            // CPU 相关命令
            get_cpu_info,
            get_cpu_detailed_info,
            get_cpu_usage,
            
            // GPU 相关命令
            get_gpu_info,
            get_gpu_detailed_info,
            get_gpu_usage,
            
            // 内存相关命令
            get_memory_info,
            get_memory_detailed_info,
            get_memory_modules,
            get_memory_usage,
            
            // 磁盘相关命令
            get_disk_info,
            get_disk_list,
            get_disk_health,
            
            // 主板相关命令
            get_motherboard_info,
            get_bios_info,
            
            // 系统相关命令
            get_system_info,
            
            // 监控相关命令
            get_temperatures,
            get_network_usage,
            get_network_speed,
            get_fan_info,
            
            // 工具相关命令
            scan_cache,
            scan_temp,
            scan_logs,
            scan_recycle,
            scan_browser,
            scan_all,
            get_startup_items,
            toggle_startup,
            delete_startup,
            scan_drivers,
            update_driver,
            get_network_info,
            run_ping,
            
            // 性能测试
            run_cpu_benchmark,
            run_gpu_benchmark,
            run_disk_benchmark,
            
            // 设置相关
            get_settings,
            save_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
