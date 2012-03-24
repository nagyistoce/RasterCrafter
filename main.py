#!/usr/bin/env python
#
# Copyright 2012 Jesse Hattabaugh
#
import webapp2, jinja2, os

class AppHandler(webapp2.RequestHandler):
	def render(self, name, values=dict()):
		loader = jinja2.FileSystemLoader(os.path.dirname(__file__))
		environment = jinja2.Environment(loader=loader)
		template = environment.get_template('%s.html'%name)
		self.response.out.write(template.render(values))
	

class MainPage(AppHandler):
	def get(self):
		self.render('main')

app = webapp2.WSGIApplication([('/', MainPage)], debug=True)
