package com.example.website.controller.API;

import com.example.website.response.BaseResponse;
import com.example.website.utils.ResponseCodeAndMsg;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public class BaseController {

    protected <T> ResponseEntity<BaseResponse<T>> returnSuccess(BaseResponse<T> response) {
        response.setCodeAndMsg(ResponseCodeAndMsg.SUCCESS);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    protected <T> ResponseEntity<BaseResponse<T>> returnSuccess(T data) {
        BaseResponse<T> response = new BaseResponse<>();
        response.setCodeAndMsg(ResponseCodeAndMsg.SUCCESS);
        response.setData(data);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

//    protected <T> ResponseEntity<BaseResponse<T>> returnSuccess() {
//        BaseResponse<T> response = new BaseResponse<>();
//        response.setCodeAndMsg(ResponseCodeAndMsg.SUCCESS);
//        return new ResponseEntity<>(response, HttpStatus.OK);
//    }
//
//    protected <T> ResponseEntity<BaseResponse<T>> returnOtpSuccess(T data) {
//        BaseResponse<T> response = new BaseResponse<>();
//        response.setCodeAndMsg(ResponseCodeAndMsg.OTP_SUCCESS);
//        response.setData(data);
//        return new ResponseEntity<>(response, HttpStatus.OK);
//    }
//
//    // Error responses
//    protected <T> ResponseEntity<BaseResponse<T>> returnBadRequest() {
//        BaseResponse<T> response = new BaseResponse<>();
//        response.setCodeAndMsg(ResponseCodeAndMsg.BAD_REQUEST);
//        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
//    }
//
//    protected <T> ResponseEntity<BaseResponse<T>> returnBadRequest(String customMessage) {
//        BaseResponse<T> response = new BaseResponse<>();
//        response.setCodeAndMsg(ResponseCodeAndMsg.BAD_REQUEST);
//        response.setMessage(customMessage);
//        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
//    }
//
//    protected <T> ResponseEntity<BaseResponse<T>> returnNotFound() {
//        BaseResponse<T> response = new BaseResponse<>();
//        response.setCodeAndMsg(ResponseCodeAndMsg.BATCH_NOT_FOUND);
//        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
//    }
//
//    protected <T> ResponseEntity<BaseResponse<T>> returnTokenExpired() {
//        BaseResponse<T> response = new BaseResponse<>();
//        response.setCodeAndMsg(ResponseCodeAndMsg.TOKEN_EXPIRED);
//        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
//    }
//
//    protected <T> ResponseEntity<BaseResponse<T>> returnAccessDenied() {
//        BaseResponse<T> response = new BaseResponse<>();
//        response.setCodeAndMsg(ResponseCodeAndMsg.ACCESS_IS_DENIED);
//        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
//    }
//
//    // Custom response
//    protected <T> ResponseEntity<BaseResponse<T>> returnResponse(ResponseCodeAndMsg codeAndMsg, HttpStatus httpStatus) {
//        BaseResponse<T> response = new BaseResponse<>();
//        response.setCodeAndMsg(codeAndMsg);
//        return new ResponseEntity<>(response, httpStatus);
//    }
//
//    protected <T> ResponseEntity<BaseResponse<T>> returnResponse(ResponseCodeAndMsg codeAndMsg, HttpStatus httpStatus, T data) {
//        BaseResponse<T> response = new BaseResponse<>();
//        response.setCodeAndMsg(codeAndMsg);
//        response.setData(data);
//        return new ResponseEntity<>(response, httpStatus);
//    }
}