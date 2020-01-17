from django.shortcuts import render
from .models import Course, Section
from django.http import JsonResponse
from django.db.models import Q

def home(request):

	context = {
		'sections' : Section.objects.all(),
	}

	return render(request, 'table/home.html', context)

def search(request):
	if request.GET.get('type',None) == 'course':
		abbrev = request.GET.get('data', None)
		found = Course.objects.filter( Q(abbrev__icontains = abbrev) | Q(abbrev__icontains = abbrev) )
		found = found[:20]
		namelist = []
		for el in found:
			namelist.append(el.abbrev)
		data = {'data': namelist}
		return JsonResponse(data)
	elif request.GET.get('type',None) == 'sections':
		abbrev = request.GET.get('data', None)
		sectionsdict = {}
		try:
			if '/' in abbrev:
				found = Course.objects.get(abbrev__contains = abbrev.split('/')[0])
			else:
				found = Course.objects.get(abbrev = abbrev)
			sections = Section.objects.filter( Q(coursename = found))
			for el in sections:
				i = 0
				while el.sectionname[i].isdigit():
					i += 1
				if el.sectionname[i:] not in sectionsdict:
					sectionsdict[el.sectionname[i:]] = []
				sectionsdict[el.sectionname[i:]].append('{} - {} - {} - {}'.format(el.sectionname,el.days,el.time,el.faculty))
		except:
			pass
		data = {'course':abbrev, 'data':sectionsdict}
		return JsonResponse(data)

def about(request):
	return render(request, 'table/about.html')

