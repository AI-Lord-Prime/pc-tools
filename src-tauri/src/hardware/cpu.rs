// CPU 信息获取

use serde::Deserialize;
use crate::hardware::query_wmi_ns;

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

#[derive(Debug, Deserialize)]
#[serde(rename = "MSAcpi_ThermalZoneTemperature", rename_all = "PascalCase")]
struct AcpiThermalZone {
    current_temperature: Option<i32>,
    _instance_name: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename = "Win32_TemperatureProbe", rename_all = "PascalCase")]
struct TemperatureProbe {
    current_reading: Option<i32>,
}

/// 获取 CPU 温度（摄氏度）
/// 
/// Windows 没有标准 API 直接提供 CPU 温度，这里尝试多种方式：
/// 1. ACPI 热区（MSAcpi_ThermalZoneTemperature）
/// 2. Win32_TemperatureProbe
/// 
/// 如果都失败，说明当前系统/主板不支持这些接口，需要借助 LibreHardwareMonitor 等工具。
pub fn get_cpu_temperature() -> Option<f32> {
    // 尝试 ACPI 热区
    if let Ok(zones) = query_wmi_ns::<AcpiThermalZone>("ROOT\\WMI") {
        for zone in zones {
            if let Some(temp) = zone.current_temperature {
                // ACPI 温度单位是 0.1 Kelvin，转换为摄氏度
                let celsius = (temp - 2732) as f32 / 10.0;
                if celsius > -40.0 && celsius < 150.0 {
                    return Some(celsius);
                }
            }
        }
    }

    // 尝试 Win32_TemperatureProbe
    if let Ok(probes) = query_wmi_ns::<TemperatureProbe>("ROOT\\CIMV2") {
        for probe in probes {
            if let Some(temp) = probe.current_reading {
                let celsius = temp as f32;
                if celsius > -40.0 && celsius < 150.0 {
                    return Some(celsius);
                }
            }
        }
    }

    None
}
