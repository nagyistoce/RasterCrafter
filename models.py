#! /usr/bin/env python

from google.appengine.ext import db

class Chunk(db.Model):
	created=db.DateTimeProperty(auto_now_add=True)
	modified=db.DateTimeProperty(auto_now=True)
