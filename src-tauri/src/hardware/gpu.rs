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

/// 获取 GPU 温度（摄氏度）
/// 
/// Windows 没有统一 API 获取 GPU 温度。这里尝试 NVIDIA NVML 获取 NVIDIA 独显温度。
/// AMD / Intel 显卡暂不支持，会返回 None。
pub fn get_gpu_temperature() -> Option<f32> {
    use nvml_wrapper::{Nvml, enum_wrappers::device::TemperatureSensor};

    let nvml = Nvml::init().ok()?;
    let device = nvml.device_by_index(0).ok()?;
    let temp = device.temperature(TemperatureSensor::Gpu).ok()?;

    Some(temp as f32)
}
