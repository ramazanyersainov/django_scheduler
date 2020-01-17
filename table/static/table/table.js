var colors = ['rgb(119,196,214,0.6)','rgb(191,98,165,0.6)','rgb(244,213,60,0.6)','rgb(240,139,48,0.6)','rgb(68,154,167,0.6)','rgb(231,150,160,0.6)'];
var current_color_index = 0;
function pick_next_color() {
  current_color_index ++;
  if (current_color_index == colors.length) {
    current_color_index = 0;
  }
}
function time_format(time,index) {
  if ( typeof time[index] == 'undefined') {
    return 0;
  }
  var formatted_time;
  if (time[index].substr(6,2) == "AM"){
    if (time[index][0] == "0"){
      formatted_time = '09'+time[index].substr(2,3);
    }
    else {
      formatted_time = time[index].substr(0,5);
    }
  }
  else {
    if (time[index][0] == '1') {
      formatted_time = '12'+time[index].substr(2,3);
    } else {
      var nmbr = 12 + Number(time[index][1]);
      formatted_time = nmbr.toString()+time[index].substr(2,3);
    }
  }
  return formatted_time;    
}

function time_to_coordinates(formatted_time) {
  var rounded;
  switch (formatted_time.substr(3,5)) {
    case '15':
      rounded = 29;
      break;
    case '45':
      rounded = 59;
      break;
    case '50':
      rounded = 59;
      break;
    default:
      rounded = Number(formatted_time.substr(3,5));
      break;
  }
  return ( Number(formatted_time.substr(0,2)) - 9 ) * 70 + Math.floor(( rounded/60 * 70 ));
}

function delete_sections(currentsections) {
  var i;
  var content;
  for (i = 0; i < currentsections.length; ++ i) {
    $("#"+currentsections[i]['day']+" div").each(function(){
      if ($(this).html() == currentsections[i]['content']) {
        $(this).remove();
      }
    });
  }
}

function search_course(query) {
  $.ajax({
      method: "GET",
      url : "search/",
      data: {'type':'sections', 'data':query},
      success: function(data) {
        if (data.data == '') {
          $("#select-block").hide();
          return;
        }
        content = "<h5>" + data.course + "</h5>";
        for (var key in data.data) {
          content += '<fieldset class="form-group"><div class="row"><div class="col"><legend class="col-form-label col-sm-1 pt-0">'+ key + '</legend>';
          for (var j in data.data[key]) {
            content += '<div class="form-check"><input class="form-check-input" type="radio" name="gridRadios' + key +  '" id="gridRadios' + data.data[key][j] + '"value="' + data.data[key][j] + '"><label class="form-check-label" for="gridRadios' + data.data[key][j] + '">' + data.data[key][j] + '</label></div>';
          }
          content += '</div></div></fieldset>';
        }
        $("#select-section").html(content);
        $("#select-block").show();
        $("#add-course-button").html("Add Course");
      }
    });
}

$( document ).ready(function() {

  var currentsections = [];
  var added_sections = [];
  var clashed_sections = [];

  function draw_sections(currentsections) {
    var i;
    var content;
    for (i = 0; i < currentsections.length; ++ i) {
      if (section_clash(currentsections[i],added_sections.concat(currentsections.slice(0,i)))) {
        content = "<div class='section' style = 'overflow-y:hidden; border-radius:2px; background-color: rgb(255,0,0,0.6); text-align: center; position:absolute; font-size:80%; width:100%; top:"+(currentsections[i]['top']+30)+"px; height:"+ (currentsections[i]['down'] - currentsections[i]['top']) +"px;'>" + currentsections[i]['content'] + "</div>";
        clashed_sections.push(currentsections[i]);
      } else {
        content = "<div class='section' style = 'overflow-y:scroll; border-radius:2px; background-color: "+colors[current_color_index]+"; text-align: center; position:absolute; font-size:80%; width:100%; top:"+(currentsections[i]['top']+30)+"px; height:"+ (currentsections[i]['down'] - currentsections[i]['top']) +"px;'>" + currentsections[i]['content'] + "</div>";
      }
      var temp = $("#"+currentsections[i]['day']).html();
      $("#"+currentsections[i]['day']).html(temp + content);
    }     
  }

  function section_clash(section,added_sections) {
    var clashed = added_sections.filter(obj => obj['day'] ===  section['day']);
    for (i = 0; i < clashed.length; ++ i) {
      if ((clashed[i]['top'] <= section['top'] && clashed[i]['down'] >= section['top']) || (clashed[i]['top'] >= section['top'] && clashed[i]['top'] <= section['down'])) {
        return true;
      }
    }
    return false;
  }

  $('#sectionaddform').change(function() {
    delete_sections(currentsections);
    currentsections = [];
    clashed_sections = [];

    $('input:checked','#sectionaddform').each(function() {
      var value = $(this).val().split(" - ");
      var days = value[1].split(' ');
      var time = value[2].split('-');

      var top = time_format(time, 0);
      var down = time_format(time, 1);
      var i;
      if (days == '') {
        return true;
      }
      for (i = 0; i < days.length; ++ i) {
        var item = {'day':days[i],'top':time_to_coordinates(top),'down':time_to_coordinates(down),'content':$("h5","#sectionaddform").text() + '<br>' + value[0] + ' ' + value[2] + '<br>' +  value[3]}
        currentsections.push(item);
      }
    });

    draw_sections(currentsections);
  });

  $("#searchform").submit(function(e) {
    e.preventDefault();
    var query = $("#searchbox").val();
    $.ajax({
      method: "GET",
      url : "search/",
      data: {'type':'course', 'data':query},
      success: function(data) {
        var i;
        content = "";
        for (i = 0; i < data.data.length; ++ i) {
          content = content + '<a href="#" class="list-group-item list-group-item-action">' + data.data[i] + "</a>";
        }
        $('#courselist').html(content)
      }
    })
  });
  $("#courselist").on('click','a',function() {
    if ($("#sectionaddform").is(":hidden")) {
      var query = $(this).text();
      //query = query.replace(/\n/ig, '');
      if (added_sections.filter(obj => obj['content'].split('<br>')[0] ===  query).length) {
        alert("This course has already been added");
        return false;
      }
      search_course(query);
    } else {
      alert("finish adding/editing chosen course");
    }
  });
  $("#discard-button").click(function(){
    delete_sections(currentsections);
    currentsections = [];
    $("#select-block").hide();
  });

  $("#sectionaddform").submit(function(e){
    e.preventDefault();
    if (clashed_sections.length) {
      alert("time clash!");
      return false;
    }
    if ($('input:checked','#sectionaddform').length != $('#sectionaddform fieldset').length) {
      alert("select all section types!");
      return false;
    }
    var i;
    for (i = 0; i < currentsections.length; ++ i) {
      added_sections.push(currentsections[i]);
    }
    currentsections = [];
    $("#select-block").hide();
    pick_next_color();
  });

  $(".day-grid").on("click",'div',function(){
    var div_content = $(this).html();
    if ($("#sectionaddform").is(":hidden")) {
      currentsections = added_sections.filter(obj => obj['content'].split('<br>')[0] ===  div_content.split("<br>")[0]);
      added_sections = added_sections.filter(x => !currentsections.includes(x));
      edit_course(currentsections[0]['content'].split("<br>")[0]);
    }
  })

  function edit_course(query) {
    var sections = new Set([]);
    $(".day-grid div:contains("+query+")").each(function(){
      sections.add($(this).html().split("<br>")[1].split(' ')[0]);
    });

    $.ajax({
      method: "GET",
      url : "search/",
      data: {'type':'sections', 'data':query},
      success: function(data) {
        if (data.data == '') {
          $("#select-block").hide();
          return;
        }
        content = "<h5>" + data.course + "</h5>";
        for (var key in data.data) {
          content += '<fieldset class="form-group"><div class="row"><div class="col"><legend class="col-form-label col-sm-1 pt-0">'+ key + '</legend>';
          for (var j in data.data[key]) {
            if (sections.has(data.data[key][j].split(' ')[0])) {
              content += '<div class="form-check"><input class="form-check-input" type="radio" name="gridRadios' + key +  '" id="gridRadios' + data.data[key][j] + '"value="' + data.data[key][j] + '" checked><label class="form-check-label" for="gridRadios' + data.data[key][j] + '">' + data.data[key][j] + '</label></div>';
            } else {
              content += '<div class="form-check"><input class="form-check-input" type="radio" name="gridRadios' + key +  '" id="gridRadios' + data.data[key][j] + '"value="' + data.data[key][j] + '"><label class="form-check-label" for="gridRadios' + data.data[key][j] + '">' + data.data[key][j] + '</label></div>';
            }
          }
          content += '</div></div></fieldset>';
        }
        $("#select-section").html(content);
        $("#select-block").show();
        $("#add-course-button").html("Edit");
      }
    });
  }
});