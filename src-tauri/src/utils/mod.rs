// 工具函数模块

use std::time::{SystemTime, UNIX_EPOCH};

/// 格式化时间戳
pub fn format_timestamp(timestamp: u64) -> String {
    use chrono::{DateTime, Utc};
    
    let dt = DateTime::<Utc>::from(SystemTime::UNIX_EPOCH + std::time::Duration::from_secs(timestamp));
    dt.format("%Y-%m-%d %H:%M:%S").to_string()
}

/// 获取当前时间字符串
pub fn get_current_time() -> String {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap();
    format_timestamp(now.as_secs())
}

/// 安全地获取环境变量
pub fn get_env_var(key: &str) -> Option<String> {
    std::env::var(key).ok()
}

/// 检查路径是否存在
pub fn path_exists(path: &str) -> bool {
    std::path::Path::new(path).exists()
}

/// 获取文件大小
pub fn get_file_size(path: &str) -> Option<u64> {
    std::fs::metadata(path).ok().map(|m| m.len())
}

/// 计算目录大小
pub fn get_dir_size(path: &str) -> u64 {
    let mut total_size = 0;
    
    if let Ok(entries) = std::fs::read_dir(path) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                if metadata.is_file() {
                    total_size += metadata.len();
                } else if metadata.is_dir() {
                    total_size += get_dir_size(&entry.path().to_string_lossy());
                }
            }
        }
    }
    
    total_size
}
