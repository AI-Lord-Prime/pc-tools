// 磁盘信息获取

use serde::Deserialize;
use crate::hardware::query_wmi_ns;

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

#[derive(Debug, Deserialize)]
#[serde(rename = "MSStorageDriver_ATAPISmartData", rename_all = "PascalCase")]
struct SmartData {
    vendor_specific: Vec<u8>,
    _instance_name: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename = "MSStorageDriver_FailurePredictData", rename_all = "PascalCase")]
struct FailurePredictData {
    vendor_specific: Vec<u8>,
    _instance_name: String,
}

pub struct SmartResult {
    pub temperature: f32,
    pub health: f32,
    pub power_on_hours: u32,
    pub power_cycle: u32,
}

/// 从 SMART 属性数据中提取温度
/// 
/// SMART 属性通常是 12 字节一个条目，格式：
/// [ID(1) | 标志(2) | 当前值(1) | 最差值(1) | 阈值(1) | 原始值(6)]
/// 温度常见属性 ID：0xBE（气流温度）、0xC2（温度）
fn parse_temperature_from_smart(vendor_specific: &[u8]) -> Option<f32> {
    // 跳过前 2 字节头部（部分实现）
    let data = if vendor_specific.len() > 362 {
        &vendor_specific[2..]
    } else {
        vendor_specific
    };

    for chunk in data.chunks(12) {
        if chunk.len() < 12 {
            continue;
        }
        let id = chunk[0];
        if id == 0xBE || id == 0xC2 {
            // 原始值低字节通常是摄氏温度
            let temp = chunk[5] as f32;
            if temp > 0.0 && temp < 120.0 {
                return Some(temp);
            }
        }
    }

    None
}

/// 获取磁盘温度（摄氏度）
/// 
/// 通过 WMI ROOT\\WMI 命名空间下的 SMART 数据查询。
/// 需要磁盘/主板支持 SMART，且通常只对 SATA 硬盘有效。
pub fn get_disk_temperature() -> Option<f32> {
    if let Ok(smart_list) = query_wmi_ns::<SmartData>("ROOT\\WMI") {
        for smart in smart_list {
            if let Some(temp) = parse_temperature_from_smart(&smart.vendor_specific) {
                return Some(temp);
            }
        }
    }

    if let Ok(predict_list) = query_wmi_ns::<FailurePredictData>("ROOT\\WMI") {
        for predict in predict_list {
            if let Some(temp) = parse_temperature_from_smart(&predict.vendor_specific) {
                return Some(temp);
            }
        }
    }

    None
}

pub fn get_disk_smart_data() -> Option<SmartResult> {
    get_disk_temperature().map(|temp| SmartResult {
        temperature: temp,
        health: 100.0,
        power_on_hours: 0,
        power_cycle: 0,
    })
}
