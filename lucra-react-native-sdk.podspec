require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))
folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'
fabric_enabled = ENV['RCT_NEW_ARCH_ENABLED'] == '1'

Pod::Spec.new do |s|
  s.name         = "lucra-react-native-sdk"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "15.1" }
  s.source       = { :git => "https://github.com/Lucra-Sports/lucra-react-native-sdk", :tag => "#{s.version}" }
  s.source_files = "ios/**/*.{h,mm,swift}"
  
  s.dependency 'LucraSDK', '2.5.0'
  
  if fabric_enabled
    install_modules_dependencies(s)
  else
    s.dependency "React-Core"
  end
end
