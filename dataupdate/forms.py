from django import forms

class UploadCoursesForm(forms.Form):
    SSH_FILE = forms.FileField(label = "SSH File")
    SEDS_FILE = forms.FileField(label = "SEDS File")
    SMG_FILE = forms.FileField(label = "SMG File")