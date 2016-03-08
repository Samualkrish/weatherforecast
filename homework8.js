var map, dataJSON, submit = false;

var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getTime(time) {
    var splitTable = time.split(":");
    if (splitTable[0] < 12) {
        hour = (splitTable[0] == 0) ? "12" : splitTable[0];
        if (hour.toString().length == 1)
            hour = "0" + hour;
        timeVal = hour + ":" + splitTable[1] + " AM";
    } else {
        hour = (splitTable[0] % 12 == 0) ? "12" : splitTable[0] % 12;
        if (hour.toString().length == 1)
            hour = "0" + hour;
        timeVal = hour + ":" + splitTable[1] + " PM";
    }
    return timeVal;
}

function getPrecipitation(precip) {
    var precipitation;
    if (precip >= 0 && precip < 0.002)
        precipitation = "None";
    else if (precip >= 0.002 && precip < 0.017)
        precipitation = "Very Light";
    else if (precip >= 0.017 && precip < 0.1)
        precipitation = "Light";
    else if (precip >= 0.1 && precip < 0.4)
        precipitation = "Moderate";
    else if (precip >= 0.4)
        precipitation = "Heavy";
    return precipitation;
}

function getImage(name) {
    var imageUrl = "";
    if (name == "clear-day")
        imageUrl = "http://cs-server.usc.edu:45678/hw/hw8/images/clear.png";
    else if (name == "clear-night")
        imageUrl = "http://cs-server.usc.edu:45678/hw/hw8/images/clear_night.png";
    else if (name == "rain")
        imageUrl = "http://cs-server.usc.edu:45678/hw/hw8/images/rain.png";
    else if (name == "snow")
        imageUrl = "http://cs-server.usc.edu:45678/hw/hw8/images/snow.png";
    else if (name == "sleet")
        imageUrl = "http://cs-server.usc.edu:45678/hw/hw8/images/sleet.png";
    else if (name == "wind")
        imageUrl = "http://cs-server.usc.edu:45678/hw/hw8/images/wind.png";
    else if (name == "fog")
        imageUrl = "http://cs-server.usc.edu:45678/hw/hw8/images/fog.png";
    else if (name == "cloudy")
        imageUrl = "http://cs-server.usc.edu:45678/hw/hw8/images/cloudy.png";
    else if (name == "partly-cloudy-day")
        imageUrl = "http://cs-server.usc.edu:45678/hw/hw8/images/cloud_day.png";
    else if (name == "partly-cloudy-night")
        imageUrl = "http://cs-server.usc.edu:45678/hw/hw8/images/cloud_night.png";

    return imageUrl;
}

function getFullDay(day) {
    var fullDay;
    if (day == 0) {
        fullDay = "Sunday";
    } else if (day == 1) {
        fullDay = "Monday";
    } else if (day == 2) {
        fullDay = "Tuesday";
    } else if (day == 3) {
        fullDay = "Wednesday";
    } else if (day == 4) {
        fullDay = "Thursday";
    } else if (day == 5) {
        fullDay = "Friday";
    } else if (day == 6) {
        fullDay = "Saturday";
    }
    return fullDay;
}

function postToFB() {
    FB.ui({
        method: 'feed',
        app_id: 532178986936566,
        link: "http://forecast.io",
        name: 'Current Weather in ' + $("#city").val().trim() + ',' + $("#states").val().trim(),
        description: dataJSON.currently.summary + ', ' + Math.round(dataJSON.currently.temperature) + '\u00b0' + $("input[name=degree]:checked").val().trim(),
        caption: "WEATHER INFORMATION FROM FORECAST.IO",
        picture: $("#currentImage").attr('src')
    }, function (resp) {
        if (resp && resp.post_id) {
            alert("Posted successfully");
        } else {
            alert("Not Posted");
        }
    });
}

$(document).ready(function () {

    $(":input").change(function () {
        $(this).val($(this).val().trim());
    });

    $.validator.addMethod("valueNotEquals", function (value, element, arg) {
        return arg != value;
    }, "Please select a state");

    $("#form").validate({
        rules: {
            street: {
                required: true
            },
            city: {
                required: true
            },
            states: {
                valueNotEquals: ""
            }
        },
        messages: {
            street: "Please enter the street address",
            city: "Please enter the city",
            states: {
                valuesNotEquals: "Please select a state"
            }
        },
        submitHandler: function (form) {
            submitAJAX();
        },
        invalidHandler: function (form) {

        }
    });

    function submitAJAX() {
        $("#streetError").text("");
        $("#cityError").text("");
        $("#stateError").text("");
        data = {};
        data.street = $("#street").val().trim();
        data.city = $("#city").val().trim();
        data.state = $("#states").val().trim();
        data.degree = $("input[name=degree]:checked").val().trim();
        $.ajax({
            url: "http://usccsci571sam-env.elasticbeanstalk.com/forecast.php",
            type: "GET",
            data: data,
            dataType: "JSON",
            crossDomain: true,
            success: function (data, textStatus, jqXHR) {
                $("#formData").removeClass("hidden");
                $("#formData").addClass("show");
                dataJSON = data;
                setValues(data);
                set24Hours(data);
                set7Days(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert(textStatus);
            }
        });
    }

    function setValues(data) {
        var deg = $("input[name=degree]:checked").val().trim();
        //        $("#degVal").text("\u00b0" + deg);
        $("#summary").text(data.currently.summary + " in " + $("#city").val().trim() + "," + $("#states").val().trim());
        $("#middle").empty();
        $("#middle").append("<span id=\"temperature\">" + Math.round(data.currently.temperature) + "<span id=\"degVal\">\u00b0" + deg + "</span></span>");
        $("#currentImage").attr("src", getImage(data.currently.icon));
        $("#currentImage").attr("alt", data.currently.summary);
        $("#currentImage").attr("title", data.currently.summary);
        $("#high").text("H: " + Math.round(data.daily.data[0].temperatureMax) + " \u00b0");
        $("#low").text("L: " + Math.round(data.daily.data[0].temperatureMin) + " \u00b0");
            
        if (deg == "F") {
            $("#precipitation").text(getPrecipitation(data.currently.precipIntensity));
            $("#chanceofrain").text((data.currently.precipProbability * 100).toFixed(0) + " %");
            $("#windspeed").text((data.currently.windSpeed).toFixed(2) + " mph");
            $("#dewpoint").text((data.currently.dewPoint).toFixed(2) + " \u00b0F");
            $("#humidity").text((data.currently.humidity * 100).toFixed(0) + " %");
            $("#visibility").text(data.currently.visibility.toFixed(2) + " mi");
        } else if (deg == "C") {
            $("#precipitation").text(getPrecipitation(data.currently.precipIntensity * 0.039370));
            $("#chanceofrain").text((data.currently.precipProbability * 100) + " %");
            $("#windspeed").text((data.currently.windSpeed).toFixed(2) + " m/s");
            $("#dewpoint").text((data.currently.dewPoint).toFixed(2) + " \u00b0C");
            $("#humidity").text((data.currently.humidity * 100).toFixed(0) + " %");
            $("#visibility").text(data.currently.visibility.toFixed(2) + " km");
        }
        $("#sunrise").text(moment.tz((data.daily.data[0].sunriseTime * 1000),data.timezone).format("hh:mm A"));
        $("#sunset").text(moment.tz((data.daily.data[0].sunsetTime * 1000),data.timezone).format("hh:mm A"));
        setMap(data);
    }

    function setMap(data) {

        if (!map) {
            var lat = data.latitude;
            var lon = data.longitude;
            var lonlat = new OpenLayers.LonLat(lon, lat).transform(new OpenLayers.Projection('EPSG:4326'), new OpenLayers.Projection('EPSG:900913'));
            map = new OpenLayers.Map("map");
            var mapOSM = new OpenLayers.Layer.OSM();
            var layer_cloud = new OpenLayers.Layer.XYZ(
                "clouds",
                "http://${s}.tile.openweathermap.org/map/clouds/${z}/${x}/${y}.png", {
                    isBaseLayer: false,
                    opacity: 0.7,
                    sphericalMercator: true

                }
            );

            var layer_precipitation = new OpenLayers.Layer.XYZ(
                "precipitation",
                "http://${s}.tile.openweathermap.org/map/precipitation/${z}/${x}/${y}.png", {
                    isBaseLayer: false,
                    opacity: 0.7,
                    sphericalMercator: true
                }
            );
            
            map.addLayers([mapOSM, layer_precipitation, layer_cloud]);
            map.setCenter(lonlat, 9);
        } else {
            var lat = data.latitude;
            var lon = data.longitude;
            var lonlat = new OpenLayers.LonLat(lon, lat).transform(new OpenLayers.Projection('EPSG:4326'), new OpenLayers.Projection('EPSG:900913'))
            map.setCenter(lonlat, 9);
        }
    }

    function set24Hours(data) {
        var deg = $("input[name=degree]:checked").val().trim();
        $("#deg24Header").text("(\u00b0" + deg + ")");
        $("#bodyTable").empty();
        for (i = 0; i < data.hourly.data.length && i < 24; i++) {
            var id = "accrodian" + i;
            var time = new Date(data.hourly.data[i].time * 1000);
            var windSpeed = data.hourly.data[i].windSpeed.toFixed(2) + ((deg == "F") ? " mph" : " m/s");
            var humidity = (data.hourly.data[i].humidity * 100).toFixed(0) + " %";
            var visibility = (data.hourly.data[i].visibility === undefined) ? "N.A" : ((data.hourly.data[i].visibility).toFixed(2) + ((deg == "F") ? " mi" : " km"));
            var pressure = data.hourly.data[i].pressure.toFixed(2) + ((deg == "F") ? " mb" : " hPa");

            $("#bodyTable").append("<tr><td><span>" + moment.tz((data.hourly.data[i].time * 1000),data.timezone).format("hh:mm A") + "</span></td><td><img src=\"" + getImage(data.hourly.data[i].icon) + "\" alt=\"" + data.hourly.data[i].summary + "\" title=\"" + data.hourly.data[i].summary + "\" height=\"40\" /></td><td>" + Math.round(data.hourly.data[i].cloudCover * 100) + " %" + "</td><td>" + data.hourly.data[i].temperature.toFixed(2) + "</td><td><span data-toggle=\"collapse\" data-target=\"#" + id + "\" class=\"clickable blue glyphicon glyphicon-plus\"></span></td></tr><tr><td colspan=\"5\" style=\"padding:0\"><div id=\"" + id + "\" class=\"collapse well zeroVal\"><table id=\"tableBack\" class=\"table table-responsive table-striped\"><thead class=\"centerHeader\" align=\"center\"><tr><th>Wind</th><th>Humidity</th><th>Visibility</th><th>Pressure</th></tr></thead><tbody align=\"center\"><tr><td>" + windSpeed + "</td><td>" + humidity + "</td><td>" + visibility + "</td><td>" + pressure + "</td></tr></tbody></table></div><hr style=\"border: 1px solid #ddd;\"/></td></tr>");
        }
    }

    function set7Days(data) {
        var deg = $("input[name=degree]:checked").val().trim();
        $("#table7days").empty();
        for (i = 1; i < data.daily.data.length; i++) {
            var id = "modal" + i;

            var visibility = ((data.daily.data[i].visibility === undefined) ? "N.A" : (data.daily.data[i].visibility).toFixed(2) + ((deg == "F") ? " mi" : " km"));
            var time = new Date(data.daily.data[i].time * 1000);
            var header = "Weather in " + $("#city").val().trim() + " on " + month[time.getMonth()] + " " + time.getDate();

            $("#table7days").append("<div class=\"xs-col paddingDays color" + i + " clickable centerAlign\" data-toggle=\"modal\" data-target=\"#" + id + "\"><table class=\"daystable\" align=\"center\"><tr><td><label class=\"control-label day\">" + getFullDay(time.getDay()) + "</label></td></tr><tr><td><label class=\"control-label\">" + month[time.getMonth()] + " " + time.getDate() + "</label></td></tr><tr><td><label class=\"control-label\"><img src=\"" + getImage(data.daily.data[i].icon) + "\" alt=\"" + data.daily.data[i].summary + "\" title=\"" + data.daily.data[i].summary + "\" height=\"40\"></label></td></tr><tr><td><span class=\"minTemp\">Min<br/>Temp</span></td></tr><tr><td><h3><label class=\"control-label\">" + Math.round(data.daily.data[i].temperatureMin) + "\u00b0" + "</label></h3></td></tr><tr><td><span class=\"minTemp\">Max<br/>Temp</span></td></tr><tr><td><h3><label class=\"control-label\">" + Math.round(data.daily.data[i].temperatureMax) + "\u00b0" + "</label></h3></td></tr></table></div><div id=\"" + id + "\" class=\"modal\" fade role=\"dialog\"><div class=\"modal-dialog\"><div class=\"modal-content\"><div class=\"modal-header\"><button type=\"button\" class=\"close\" data-dismiss=\"modal\">&times;</button><h4 class=\"modal-title modalHeader\">" + header + "</h4></div><div class=\"modal-body\"><table class=\"table centerAlign\" align=center><tbody><tr><td><img src=\"" + getImage(data.daily.data[i].icon) + "\" alt=\"" + data.daily.data[i].summary + "\" title=\"" + data.daily.data[i].summary + "\" height=120/></td></tr><tr><td><h4><span class=\"day\">" + getFullDay(time.getDay()) + " : </span><span class=\"sum\">" + data.daily.data[i].summary + "</span></h4></td></tr></table><div class=\"row\"><div class=\"col-md-4\"><table class=\"table centerAlign\"><thead><tr><td><span class=\"rowHeader\">Sunrise Time</span></td></tr></thead><tbody><tr><td>" + moment.tz((data.daily.data[i].sunriseTime * 1000),data.timezone).format("hh:mm A") + "</td></tr></tbody></table></div><div class=\"col-md-4\"><table class=\"table centerAlign\"><thead><tr><td><span class=\"rowHeader\">Sunset Time</span></td></tr></thead><tbody><tr><td>" + moment.tz((data.daily.data[i].sunsetTime * 1000),data.timezone).format("hh:mm A") + "</td></tr></tbody></table></div><div class=\"col-md-4\"><table class=\"table centerAlign\"><thead><tr><td><span class=\"rowHeader\">Humidity</span></td></tr></thead><tbody><tr><td>" + (data.daily.data[i].humidity * 100) + " %" + "</td></tr></tbody></table></div></div><div class=\"row\"><div class=\"col-md-4\"><table class=\"table centerAlign\"><thead><tr><td><span class=\"rowHeader\">Wind Speed</span></td></tr></thead><tbody><tr><td>" + data.daily.data[i].windSpeed + ((deg == "F") ? " mph" : " m/s") + "</td></tr></tbody></table></div><div class=\"col-md-4\"><table class=\"table centerAlign\"><thead><tr><td><span class=\"rowHeader\">Visibility</span></td></tr></thead><tbody><tr><td>" + visibility + "</td></tr></tbody></table></div><div class=\"col-md-4\"><table class=\"table centerAlign\"><thead><tr><td><span class=\"rowHeader\">Pressure</span></td></tr></thead><tbody><tr><td>" + data.daily.data[i].pressure + ((deg == "F") ? " mb" : " hPa") + "</td></tr></tbody></table></div></div></div><div class=\"modal-footer\"><button type=\"button\" class=\"btn\" btn-default data-dismiss=\"modal\">Close</button></div></div></div>");
        }
    }

    $("#clear").click(function () {
        $("#formData").removeClass("show");
        $("#formData").addClass("hidden");
        $("#form")[0].reset();
        $("#form").validate().resetForm();
        $("#street").text("");
        $("#streetError").text("");
        $("#city").text("");
        $("#cityError").text("");
        $("#states").val("");
        $("#stateError").text("");
        $("#degreeF").checked = true;
        $("#degreeC").checked = false;
    });
});