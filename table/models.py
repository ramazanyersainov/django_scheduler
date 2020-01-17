from django.db import models

class Course(models.Model):
	abbrev = models.CharField(max_length = 100)
	cr_us = models.CharField(max_length = 10)
	cr_ects = models.CharField(max_length = 100)
	start_date = models.CharField(max_length = 100)
	end_date = models.CharField(max_length = 100)
	title = models.CharField(max_length = 100)

	def __str__(self):
		return self.abbrev


class Section(models.Model):
	coursename = models.ForeignKey(Course, on_delete = models.CASCADE)
	sectionname = models.CharField(max_length = 10)
	days = models.CharField(max_length = 100)
	time = models.CharField(max_length = 100)
	enrolled = models.IntegerField()
	capacity = models.IntegerField()
	faculty = models.CharField(max_length = 100)
	room = models.CharField(max_length = 100)

	def __str__(self):
		return "{} {}".format(self.coursename.abbrev, self.sectionname)

