// 内存信息获取

use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[serde(rename = "Win32_PhysicalMemory")]
pub struct WmiMemoryInfo {
    pub manufacturer: String,
    pub part_number: String,
    pub capacity: u64,
    pub speed: u32,
    pub memory_type: u16,
}

#[derive(Debug, Deserialize)]
#[serde(rename = "Win32_PhysicalMemoryArray")]
pub struct WmiMemoryArray {
    pub memory_devices: u32,
}
