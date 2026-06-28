// 硬件信息获取模块
// 这里可以添加更详细的硬件信息获取逻辑

pub mod cpu;
pub mod gpu;
pub mod memory;
pub mod disk;

// 使用 WMI 查询 Windows 硬件信息的辅助函数
#[cfg(target_os = "windows")]
pub fn query_wmi<T>(_query: &str) -> Result<Vec<T>, String>
where
    T: serde::de::DeserializeOwned,
{
    use wmi::{COMLibrary, WMIConnection};

    let com = COMLibrary::new().map_err(|e| e.to_string())?;
    let wmi = WMIConnection::new(com).map_err(|e| e.to_string())?;

    wmi.query::<T>().map_err(|e| e.to_string())
}
