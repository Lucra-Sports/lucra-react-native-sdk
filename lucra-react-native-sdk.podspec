require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))
folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'
fabric_enabled = ENV['RCT_NEW_ARCH_ENABLED'] == '1'

# Read local integration mode configuration from properties file
config_file = File.join(__dir__, "local-integration.properties")
enableLocalIntegrationModeiOS = false
if File.exist?(config_file)
  File.readlines(config_file).each do |line|
    if line.strip.start_with?('enableLocalIntegrationModeiOS=')
      enableLocalIntegrationModeiOS = line.split('=')[1].strip == 'true'
    end
  end
end

Pod::Spec.new do |s|
  s.name         = "lucra-react-native-sdk"
  s.module_name  = "lucra_react_native_sdk"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source_files = "ios/**/*.{h,mm,swift}"
  s.header_dir = "lucra_react_native_sdk"
  # s.header_mappings_dir = "ios"
  s.public_header_files = "ios/**/*.h"
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }
  
  if enableLocalIntegrationModeiOS
    s.source = { :path => './xcframeworks/' }
    
    s.vendored_frameworks = [
      'xcframeworks/LucraSDK.xcframework',
      'xcframeworks/MobileIntelligence.xcframework',
      'xcframeworks/GeoComplySDK.xcframework'
    ]
    
    # Dependencies required by LucraSDK.xcframework
    s.dependency 'Auth0'
  else
    s.source = { :git => "https://github.com/Lucra-Sports/lucra-react-native-sdk", :tag => "#{s.version}" }
    s.dependency 'LucraSDK', '5.4.1'
  end
  
  if fabric_enabled
    install_modules_dependencies(s)
  else
    s.dependency "React-Core"
  end
end
