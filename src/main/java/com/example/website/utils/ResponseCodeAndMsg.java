package com.example.website.utils;

public enum ResponseCodeAndMsg {
	SUCCESS(200, "SUCCESS"),
	OTP_SUCCESS(202, "SUCCESS"),
	BAD_REQUEST(404, "BAD REQUEST"),
	BATCH_NOT_FOUND(1, "Thông tin không tồn tại"),
	TOKEN_EXPIRED(-1, "Hết hạn token"),
	ACCESS_IS_DENIED(403, "Bạn không có quyền truy cập dữ liệu này");

	private int code;
	private String message;

	public int getCode() {
		return code;
	}

	public String getMessage() {
		return message;
	}

	ResponseCodeAndMsg(int code, String message) {
		this.code = code;
		this.message = message;
	}
}
