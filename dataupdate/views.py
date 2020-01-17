from django.shortcuts import render
from django.contrib.auth.decorators import user_passes_test
from django.http import HttpResponse
from table.models import Course, Section
from .forms import UploadCoursesForm
import tabula
import json
import requests, os

@user_passes_test(lambda user: user.is_superuser)
def home(request):
	form = UploadCoursesForm()
	return render(request, 'dataupdate/home.html', {'form':form} )

@user_passes_test(lambda user: user.is_superuser)
def update(request):
	def upload_file(file, name):
		with open('media/' + name + '.pdf' , 'wb+') as destination:
			for chunk in file.chunks():
				destination.write(chunk)
		tabula.convert_into("media/" +  name + ".pdf", "media/" + name + ".json", output_format="json", pages='all', guess=False, lattice=True)
		os.remove('media/' + name + '.pdf') if os.path.exists('media/' + name + '.pdf') else None

	def clear_database():
		Course.objects.all().delete()

	def load_courses(name):
		courselist = []
		with open('media/' + name + '.json', 'r') as f:
			distros_dict = json.load(f)
		j = 1
		for distro in distros_dict:
			for i in range(j,len(distro['data'])):
				data = distro['data'][i]
				try:
					if data[0]['text'] not in courselist:
						abbr = data[0]['text']
						abbr.replace('\r',' ')
						if abbr == "":
							#not valid course
							continue
						current_course = Course.objects.create(abbrev = abbr,title = data[2]['text'].replace('\r',' '), cr_us = data[3]['text'].replace('\r',''), cr_ects = data[4]['text'].replace('\r',''), start_date = data[5]['text'].replace('\r',''), end_date = data[6]['text'].replace('\r',''))
						current_course.save()
						courselist.append(abbr)
					days = data[7]['text'].replace('\r','')
					current_section = Section.objects.create(coursename = current_course, sectionname = data[1]['text'].replace('\r',''),days = days, time = data[8]['text'].replace('\r',''), enrolled = data[9]['text'].replace('\r',''), capacity = data[10]['text'].replace('\r',''), faculty = data[11]['text'].replace('\r',' '), room = data[12]['text'].replace('\r',''))
					current_section.save()
				except:
					pass
			j = 0

	if request.method == 'POST':
		form = UploadCoursesForm(request.POST, request.FILES)
		if form.is_valid():
			upload_file(request.FILES['SSH_FILE'],'ssh')
			upload_file(request.FILES['SEDS_FILE'],'seds')
			upload_file(request.FILES['SMG_FILE'],'smg')
			clear_database()
			load_courses('ssh')
			load_courses('seds')
			load_courses('smg')
			return render(request, 'dataupdate/home.html', {'message':'Successful', 'type':'alert-success', 'form':form})
	else:
		form =  UploadCoursesForm()
	return render(request, 'dataupdate/home.html', {'message':'Update Failed', 'type':'alert-danger', 'form':form})
