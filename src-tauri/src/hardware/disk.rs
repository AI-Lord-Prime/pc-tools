// 磁盘信息获取

use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[serde(rename = "Win32_DiskDrive")]
pub struct WmiDiskInfo {
    pub model: String,
    pub size: u64,
    pub interface_type: String,
    pub media_type: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename = "Win32_LogicalDisk")]
pub struct WmiLogicalDisk {
    pub device_id: String,
    pub size: u64,
    pub free_space: u64,
    pub file_system: String,
    pub volume_name: String,
}

pub fn get_disk_smart_data() -> Option<SmartData> {
    // 需要使用 SMART 库
    None
}

pub struct SmartData {
    pub temperature: f32,
    pub health: f32,
    pub power_on_hours: u32,
    pub power_cycle: u32,
}
