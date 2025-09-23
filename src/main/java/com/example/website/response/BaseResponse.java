package com.example.website.response;

import com.example.website.utils.ResponseCodeAndMsg;
import lombok.Data;

@Data
public class BaseResponse<T> {
	
	private int code = 1;
	private String message = "SUCCESS";
	private T data;
	
	public BaseResponse(T data) {
		super();
		this.data = data;
	}

	public BaseResponse() {
		super();
	}
	
	public void setCodeAndMsg(ResponseCodeAndMsg msg){
        this.code=  msg.getCode();
        this.message = msg.getMessage();
    }
}
