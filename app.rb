require 'sinatra'
require 'sinatra/content_for'
require 'rdiscount'
require 'yaml'


ROOT_PATH = "#{File.expand_path(File.dirname(__FILE__))}/"
DATA_PATH = "#{ROOT_PATH}data/"
VIEWS_PATH = "#{ROOT_PATH}views/"


helpers do
  def flash_css_class(key)
    classes = Hash.new(key.to_s)
    classes['notice'] = 'info'
    classes['error'] = 'danger'
    classes[key.to_s]
  end

  def md(text)
    RDiscount.new(text).to_html
  end
end


get '/*' do

  yaml = File.read(DATA_PATH + 'slugs.yaml')
  data = YAML.load(yaml)
  slugs = data['slugs']


  yaml = File.read(DATA_PATH + 'variables.yaml')
  data = YAML.load(yaml)
  variables = data['variables']


  view = nil
  locals = {}


  variables.each do |variable|
    key = variable['key']
    value = variable['value']
    locals[key.to_sym] = value
  end


  slugs.each do |slug|
    if params['splat'].first == slug['uri']
      slug.each do |key, value|
        locals[key.to_sym] = value
      end
      view = slug['view'].to_sym
    end
  end


  if view && view.match(/\.markdown/)
    markdown = File.read("#{VIEWS_PATH}#{view}")
    rendered = md(markdown)
    locals[:post] = rendered 
    view = :'pages/post.html'
  elsif !view
    locals[:title] = '404 Not Found'
    locals[:css_id] = 'home'
    view = :'errors/404.html'
  end

  erb view, :layout => :'layouts/default.html', :locals => locals
end



