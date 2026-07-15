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
    instance_name: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename = "Win32_TemperatureProbe", rename_all = "PascalCase")]
struct TemperatureProbe {
    current_reading: Option<i32>,
}

/// 不需要管理员权限，比 ACPI 热区更常见
#[derive(Debug, Deserialize)]
#[serde(rename = "Win32_PerfFormattedData_Counters_ThermalZoneInformation", rename_all = "PascalCase")]
struct PerfThermalZone {
    name: Option<String>,
    temperature: Option<u32>,
    high_precision_temperature: Option<u32>,
}

#[derive(Debug, Deserialize)]
#[serde(rename = "Sensor", rename_all = "PascalCase")]
struct HardwareMonitorSensor {
    name: Option<String>,
    #[serde(rename = "SensorType")]
    sensor_type: Option<String>,
    value: Option<f64>,
}

fn kelvin_tenths_to_celsius(raw: i32) -> Option<f32> {
    let celsius = (raw - 2732) as f32 / 10.0;
    if (-40.0..150.0).contains(&celsius) && celsius.abs() > 0.01 {
        Some(celsius)
    } else {
        None
    }
}

fn is_plausible_celsius(temp: f32) -> bool {
    (-40.0..150.0).contains(&temp) && temp.abs() > 0.01
}

fn zone_priority(name: &str) -> i32 {
    let lower = name.to_ascii_lowercase();
    if lower.contains("cpu") || lower.contains("processor") || lower.contains("package") {
        100
    } else if lower.contains("core") {
        80
    } else if lower.contains("tz") || lower.contains("thermal") {
        40
    } else if lower.contains("acpi") {
        20
    } else {
        10
    }
}

fn pick_best_temp(candidates: Vec<(i32, f32)>) -> Option<f32> {
    candidates
        .into_iter()
        .max_by(|a, b| {
            a.0.cmp(&b.0)
                .then(a.1.partial_cmp(&b.1).unwrap_or(std::cmp::Ordering::Equal))
        })
        .map(|(_, temp)| temp)
}

fn from_perf_thermal_zones() -> Option<f32> {
    let zones = query_wmi_ns::<PerfThermalZone>("ROOT\\CIMV2").ok()?;
    let mut candidates = Vec::new();

    for zone in zones {
        let name = zone.name.unwrap_or_default();
        let Some(raw) = zone
            .high_precision_temperature
            .filter(|&v| v > 0)
            .or_else(|| zone.temperature.filter(|&v| v > 0))
        else {
            continue;
        };
        if let Some(celsius) = kelvin_tenths_to_celsius(raw as i32) {
            candidates.push((zone_priority(&name), celsius));
        }
    }

    pick_best_temp(candidates)
}

fn from_acpi_thermal_zones() -> Option<f32> {
    let zones = query_wmi_ns::<AcpiThermalZone>("ROOT\\WMI").ok()?;
    let mut candidates = Vec::new();

    for zone in zones {
        let name = zone.instance_name.unwrap_or_default();
        if let Some(raw) = zone.current_temperature {
            if let Some(celsius) = kelvin_tenths_to_celsius(raw) {
                candidates.push((zone_priority(&name), celsius));
            }
        }
    }

    pick_best_temp(candidates)
}

fn from_temperature_probe() -> Option<f32> {
    let probes = query_wmi_ns::<TemperatureProbe>("ROOT\\CIMV2").ok()?;
    for probe in probes {
        if let Some(temp) = probe.current_reading {
            let celsius = temp as f32;
            if is_plausible_celsius(celsius) {
                return Some(celsius);
            }
        }
    }
    None
}

fn from_hardware_monitor(namespace: &str) -> Option<f32> {
    let sensors = query_wmi_ns::<HardwareMonitorSensor>(namespace).ok()?;
    let mut candidates = Vec::new();

    for sensor in sensors {
        let sensor_type = sensor.sensor_type.unwrap_or_default();
        if !sensor_type.eq_ignore_ascii_case("Temperature") {
            continue;
        }
        let name = sensor.name.unwrap_or_default();
        let value = sensor.value.unwrap_or(0.0) as f32;
        if !is_plausible_celsius(value) {
            continue;
        }
        // 优先 CPU Package / Tctl，其次各核心温度
        let mut priority = zone_priority(&name);
        if name.to_ascii_lowercase().contains("package")
            || name.to_ascii_lowercase().contains("tctl")
            || name.to_ascii_lowercase().contains("tdie")
        {
            priority += 50;
        }
        candidates.push((priority, value));
    }

    pick_best_temp(candidates)
}

/// 获取 CPU 温度（摄氏度）
///
/// Windows 没有统一的 CPU 温度 API，按可靠程度依次尝试：
/// 1. Win32_PerfFormattedData_Counters_ThermalZoneInformation（通常无需管理员）
/// 2. MSAcpi_ThermalZoneTemperature（常需管理员，且很多主板不支持）
/// 3. Win32_TemperatureProbe
/// 4. LibreHardwareMonitor / OpenHardwareMonitor（需对应软件在运行）
pub fn get_cpu_temperature() -> Option<f32> {
    if let Some(temp) = from_perf_thermal_zones() {
        return Some(temp);
    }
    if let Some(temp) = from_acpi_thermal_zones() {
        return Some(temp);
    }
    if let Some(temp) = from_temperature_probe() {
        return Some(temp);
    }
    if let Some(temp) = from_hardware_monitor("ROOT\\LibreHardwareMonitor") {
        return Some(temp);
    }
    if let Some(temp) = from_hardware_monitor("ROOT\\OpenHardwareMonitor") {
        return Some(temp);
    }

    None
}
