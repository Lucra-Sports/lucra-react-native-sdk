require "json"
require "digest"
require "fileutils"
require "tmpdir"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))
folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'
fabric_enabled = ENV['RCT_NEW_ARCH_ENABLED'] == '1'

lucra_ios_sdk_version = "8.0.1"
lucra_ios_sdk_checksums = {
  "LucraSDK" => "3454806e75fb3c2280d0a7fd10320c1b07167d451e7119afcf57c20f60976dec",
  "MobileIntelligence" => "90a85ee56f73f568d024bf0a3d7264c95f8644d8cc3968667b11b9f852fcda37",
  "GeoComplySDK" => "2dc6f34a2507f1625b90a99286843594b41ba709f50325c1f7ba5301fe58f3ca",
}
lucra_ios_sdk_dir = File.join("ios-frameworks", lucra_ios_sdk_version)

download_lucra_ios_sdk = lambda do
  destination = File.join(__dir__, lucra_ios_sdk_dir)
  lucra_ios_sdk_checksums.each do |name, checksum|
    framework = File.join(destination, "#{name}.xcframework")
    next if File.directory?(framework)

    url = "https://lucra-sdk.s3.amazonaws.com/ios/spm/#{lucra_ios_sdk_version}/#{name}.xcframework.zip"
    FileUtils.mkdir_p(destination)
    Dir.mktmpdir("download-", destination) do |staging|
      zip = File.join(staging, "#{name}.xcframework.zip")
      Pod::UI.puts "[Lucra] Downloading #{name} #{lucra_ios_sdk_version}"
      unless system("curl", "--fail", "--silent", "--show-error", "--location", "--retry", "3", "--connect-timeout", "30", "--speed-limit", "1024", "--speed-time", "60", "--output", zip, url)
        raise Pod::Informative, "[Lucra] Could not download #{url}"
      end
      actual_checksum = Digest::SHA256.file(zip).hexdigest
      unless actual_checksum == checksum
        raise Pod::Informative, "[Lucra] #{url} has checksum #{actual_checksum}, expected #{checksum}"
      end
      unless system("unzip", "-q", zip, "-d", staging)
        raise Pod::Informative, "[Lucra] Could not unzip #{url}"
      end
      File.rename(File.join(staging, "#{name}.xcframework"), framework)
    end
  end
end

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
  s.dependency 'Sentry', '>= 8.58.0', '< 9.0'

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
    download_lucra_ios_sdk.call
    s.vendored_frameworks = lucra_ios_sdk_checksums.keys.map { |name| File.join(lucra_ios_sdk_dir, "#{name}.xcframework") }
  end

  if fabric_enabled
    install_modules_dependencies(s)
  else
    s.dependency "React-Core"
  end
end
