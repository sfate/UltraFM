trap("INT") { puts "\nCatched ^-C signal. Quiting..."; exit(0) }

namespace :extension do
  desc 'Build complete chrome-extension.'
  task :pack do
    %x[zip -r 'ultra.zip' 'chrome-extension']
  end
end

