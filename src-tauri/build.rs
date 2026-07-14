fn main() {
    #[cfg(all(windows, feature = "admin-manifest"))]
    {
        use tauri_build::WindowsAttributes;
        
        let windows_attributes = WindowsAttributes::new().app_manifest(
            r#"
            <assembly xmlns="urn:schemas-microsoft-com:asm.v1" manifestVersion="1.0">
                <trustInfo xmlns="urn:schemas-microsoft-com:asm.v3">
                    <security>
                        <requestedPrivileges>
                            <requestedExecutionLevel level="requireAdministrator" uiAccess="false" />
                        </requestedPrivileges>
                    </security>
                </trustInfo>
            </assembly>
            "#,
        );

        tauri_build::try_build(tauri_build::Attributes::new().windows_attributes(windows_attributes))
            .expect("Failed to build Tauri application");
    }

    #[cfg(not(all(windows, feature = "admin-manifest")))]
    {
        tauri_build::build();
    }
}
