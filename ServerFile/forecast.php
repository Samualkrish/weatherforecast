<?php    
    header("Access-Control-Allow-Origin:*");
    # Error handling in PHP
    function errorHandler($enum, $errorMsg, $eFile, $eSeverity){
        throw new ErrorException($errorMsg);
    }
    set_error_handler("errorHandler");

    error_reporting(E_ERROR | E_WARNING | E_PARSE);

    try{
        if(isset($_GET["street"]) && isset($_GET["city"]) && isset($_GET["state"]) && isset($_GET["degree"]) ){
            $query = $_GET["street"] . "," . $_GET["city"] . "," . $_GET["state"];
            $query = urlencode($query);
            $url   = "https://maps.google.com/maps/api/geocode/xml?address=" . $query . "&key=AIzaSyB8Ibry1kMqHh4Mmwi28RnkO2q8fO_rV0g";

            $response = simplexml_load_file($url);

            if($response->status == 'OK'){
                $geometry  = $response->result[0]->geometry;
                $longitude = $geometry->location->lat;
                $latitude  = $geometry->location->lng;
                $degree    = "us";
                $deg       = "F";
                if($_GET["degree"] == "C"){
                    $degree = "si";
                    $deg    = "C";
                }
                $forecast_query = "units=" . $degree . "&exclude=flags";
                $forecast_io    = "https://api.forecast.io/forecast/d70ca97a24bd0497b277a6760b51fbec/" . $longitude . "," . $latitude . "?" . $forecast_query; 

                $forecast_result   = file_get_contents($forecast_io) or die("Unable to retrieve values from Forecast IO");
                echo $forecast_result;
            }
        }
        else{
            http_response_code(404);
            $error = array(
                "errorCode"    => "404",
                "errorMessage" => "The necessary fields are missing",
                "fields"       => "address and degree needed"
            );
            echo json_encode($error);
        }
    }catch(Exception $e){
        http_response_code(404);
        $er = array(
            "errorCode"    => "404",
            "errorMessage" => "The necessary fields are missing",
            "fields"       => "address and degree needed"
        );
        echo json_encode($er);
    }    
?>