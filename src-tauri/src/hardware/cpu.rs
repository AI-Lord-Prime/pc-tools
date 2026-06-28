// CPU 信息获取

use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[serde(rename = "Win32_Processor")]
pub struct WmiCpuInfo {
    pub name: String,
    pub manufacturer: String,
    pub number_of_cores: u32,
    pub number_of_logical_processors: u32,
    pub max_clock_speed: u32,
    pub l2_cache_size: u32,
    pub l3_cache_size: u32,
}

pub fn get_cpu_temperature() -> Option<f32> {
    // 需要使用硬件监控库或 WMI 查询
    // 这里返回模拟值
    Some(55.0)
}
