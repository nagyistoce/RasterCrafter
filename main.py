#!/usr/bin/env python
#
# Copyright 2012 Jesse Hattabaugh
#
import webapp2, jinja2, os
import models

class AppHandler(webapp2.RequestHandler):
	def render(self, name, values=dict()):
		loader = jinja2.FileSystemLoader(os.path.dirname(__file__))
		environment = jinja2.Environment(loader=loader)
		template = environment.get_template('%s.html'%name)
		self.response.out.write(template.render(values))

class Main(AppHandler):
	def get(self):
		self.render('main')

class Chunks(AppHandler):
	def get(self):
		# loads chunks from datastore and outputs them as json
		self.render('main', dict(debug='getted chunk'))
	def post():
		# validates and stores chunk creation and modification parameters from the client
		pass

app = webapp2.WSGIApplication([
	('/', Main),
	('/chunks', Chunks)
], debug=True)
