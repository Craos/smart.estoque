<?php
/**
 * Created by PhpStorm.
 * User: oberdanbrito
 * Date: 11/11/18
 * Time: 14:24
 * action=loadImage&itemId=user_photo&itemValue=avatar.jpg&dhxr1441638923235=1
 */

@session_start();
$idd = session_id();

// this part is for loading image into item
if (@$_REQUEST["action"] == "loadImage") {

    // load any default image
    $i = "default.png";

    // check if requested image exists
    $k = "foto/".$_REQUEST["itemValue"];
    if (file_exists($k)) $i = $k;

    // output image
    header("Content-Type: image/jpg");
    print_r(file_get_contents($i));

}

// this part is for uploading the new one
if (@$_REQUEST["action"] == "uploadImage") {

    $filename = md5($_FILES["file"]["name"]).'.jpg';
    @unlink("foto/".$filename);

    move_uploaded_file($_FILES["file"]["tmp_name"], "foto/".$filename);

    header("Content-Type: text/html; charset=utf-8");
    print_r("{state: true, itemId: '".@$_REQUEST["itemId"]."', itemValue: '".str_replace("'","\\'",$filename)."'}");

}