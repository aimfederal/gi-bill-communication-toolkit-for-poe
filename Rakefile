class String
  def colorize(c); "\e[#{c}m#{self}\e[0m" end
  def error; colorize("1;31") end
  def bold; colorize("1") end
  def status; colorize("1;34") end
  def titlecase
    self.gsub(/\w+/) do |word|
      word.capitalize
    end
  end
end

desc "Build Institutions"
task :build do

  require 'csv'
  require 'yaml'
  require 'json'

  # Start the timer
  start = Time.now

  puts "Parsing `_data/data.csv`".bold

  # Array containing all data
  data = []

  CSV.foreach("_data/data.csv", :headers => true, :header_converters => :symbol) do |row|
    f = row.fields

    # Convert data types (booleans)
    f.map! do |f|
      if f == "Yes"
        true
      elsif f == "No"
        false
      elsif f == "NR"
        nil
      else
        f
      end
    end

    # Convert data types (numbers)
    unless f[5] == nil;  f[5] = f[5].to_i   end # bah
    unless f[8] == nil;  f[8] = f[8].to_i   end # gibill
    unless f[9] == nil;  f[9] = f[9].to_i   end # cross
    unless f[10] == nil; f[10] = f[10].to_f end # grad_rate
    unless f[11] == nil; f[11] = f[11].to_i end # grad_rate_rank
    unless f[12] == nil; f[12] = f[12].to_f end # default_rate
    unless f[13] == nil; f[13] = f[13].to_i end # avg_stu_loan_debt
    unless f[14] == nil; f[14] = f[14].to_i end # avg_stu_loan_debt_rank
    unless f[15] == nil; f[15] = f[15].to_i end # indicator_group
    unless f[17] == nil; f[17] = f[17].rjust(5, '0') end # zip
    unless f[18] == nil; f[18].tr!('"', '') end # ope
    unless f[22] == nil; f[22] = f[22].to_i end # tuition_in_state
    unless f[23] == nil; f[23] = f[23].to_i end # tuition_out_of_state

    # Save row to array
    data.push Hash[row.headers[0..-1].zip(f[0..-1])]
  end

  puts "Writing `api/institutions.json`".bold

  # Array of only institution facility_codes
  institutions = []

  data.each do |el|
    institutions.push el[:facility_code]
  end

  File.open("api/institutions.json", 'w') { |f| f.write(institutions.to_json) }

  puts "Writing institution data".bold

  data.each do |el|
    dir_path = "api/#{el[:facility_code][0..2]}"
    FileUtils.mkdir_p dir_path
    File.open("#{dir_path}/#{el[:facility_code]}.json", 'w') { |f| f.write(JSON.pretty_generate(el)) }
  end

  puts "Finished in #{(Time.now - start).round(2)} seconds".status
end

task :default => :build
