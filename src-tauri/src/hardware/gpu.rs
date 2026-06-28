// GPU 信息获取

use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[serde(rename = "Win32_VideoController")]
pub struct WmiGpuInfo {
    pub name: String,
    pub adapter_ram: u64,
    pub driver_version: String,
    pub video_processor: String,
}

pub fn get_gpu_temperature() -> Option<f32> {
    // 需要使用 NVML 或类似库
    Some(50.0)
}
