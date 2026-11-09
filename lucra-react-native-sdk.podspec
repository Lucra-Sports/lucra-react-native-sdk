require "json"
require "digest"
require "fileutils"
require "tmpdir"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))
folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'
fabric_enabled = ENV['RCT_NEW_ARCH_ENABLED'] == '1'

lucra_ios_sdk_version = "8.0.0"
lucra_ios_sdk_checksums = {
  "LucraSDK" => "c82c99142a8a74b53cd40cab8dccd72b3458550e1df5ff4e5325071ccb039c19",
  "MobileIntelligence" => "c3cbae8b71b8be12f7032906b472215afc09fc3dc1d24d1ea1a51a08d76eb86f",
  "GeoComplySDK" => "3e8fd70a9974cfeb9164ca218c5de1127451f5e14d8ed6d680b2d00534881aec",
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
