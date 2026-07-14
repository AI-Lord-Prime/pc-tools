// 硬件信息获取模块
// 这里可以添加更详细的硬件信息获取逻辑

pub mod cpu;
pub mod gpu;
pub mod memory;
pub mod disk;

use wmi::{COMLibrary, WMIConnection};

/// 获取 WMI 连接，自动处理 COM 已初始化的情况
fn get_wmi_com() -> Result<COMLibrary, String> {
    match COMLibrary::new() {
        Ok(com) => Ok(com),
        Err(_) => {
            // COM 可能已经以其他模式初始化
            let com = unsafe { COMLibrary::assume_initialized() };
            Ok(com)
        }
    }
}

/// 使用 WMI 查询 Windows 硬件信息（默认 ROOT\CIMV2 命名空间）
#[cfg(target_os = "windows")]
pub fn query_wmi<T>() -> Result<Vec<T>, String>
where
    T: serde::de::DeserializeOwned,
{
    let com = get_wmi_com()?;
    let wmi = WMIConnection::new(com).map_err(|e| e.to_string())?;
    wmi.query::<T>().map_err(|e| e.to_string())
}

/// 使用 WMI 查询指定命名空间
#[cfg(target_os = "windows")]
pub fn query_wmi_ns<T>(namespace: &str) -> Result<Vec<T>, String>
where
    T: serde::de::DeserializeOwned,
{
    let com = get_wmi_com()?;
    let wmi = WMIConnection::with_namespace_path(namespace, com).map_err(|e| e.to_string())?;
    wmi.query::<T>().map_err(|e| e.to_string())
}
