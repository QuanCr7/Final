package com.example.website.exception;

import com.example.website.utils.ResponseCodeAndMsg;

public class ApiException extends RuntimeException {
    private int code;
    private String message = "";
    private Object data;

    public ApiException(int code) {
        this.code = code;
        this.message = "";
    }

    public ApiException(ResponseCodeAndMsg exception) {
        super(exception.getMessage());
        this.code = exception.getCode();
        this.message = exception.getMessage();
    }

    public ApiException(ResponseCodeAndMsg exception, Object data) {
        super(exception.getMessage());
        this.code = exception.getCode();
        this.message = exception.getMessage();
        this.data = data;
    }

    public ApiException(ResponseCodeAndMsg exception, String errorMsg) {
        super(errorMsg);
        this.code = exception.getCode();
        this.message = errorMsg;
    }

    public ApiException(ResponseCodeAndMsg exception, String errorMsg, Object data) {
        super(errorMsg);
        this.code = exception.getCode();
        this.message = errorMsg;
        this.data = data;
    }

    public ApiException(int code, String message) {
        super(message);
        this.code = code;
        this.message = message;
    }

    public ApiException() {
        this.message = "";
    }

    public int getCode() {
        return this.code;
    }

}
