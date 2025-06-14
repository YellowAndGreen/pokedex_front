// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AuthResponse _$AuthResponseFromJson(Map<String, dynamic> json) => AuthResponse(
      accessToken: json['access_token'] as String,
      tokenType: json['token_type'] as String,
      expiresIn: (json['expires_in'] as num?)?.toInt(),
    );

Map<String, dynamic> _$AuthResponseToJson(AuthResponse instance) =>
    <String, dynamic>{
      'access_token': instance.accessToken,
      'token_type': instance.tokenType,
      'expires_in': instance.expiresIn,
    };

VerificationRequest _$VerificationRequestFromJson(Map<String, dynamic> json) =>
    VerificationRequest(
      email: json['email'] as String,
    );

Map<String, dynamic> _$VerificationRequestToJson(
        VerificationRequest instance) =>
    <String, dynamic>{
      'email': instance.email,
    };

VerifyCodeRequest _$VerifyCodeRequestFromJson(Map<String, dynamic> json) =>
    VerifyCodeRequest(
      email: json['email'] as String,
      code: json['code'] as String,
    );

Map<String, dynamic> _$VerifyCodeRequestToJson(VerifyCodeRequest instance) =>
    <String, dynamic>{
      'email': instance.email,
      'code': instance.code,
    };

ValidationError _$ValidationErrorFromJson(Map<String, dynamic> json) =>
    ValidationError(
      loc: json['loc'] as List<dynamic>,
      msg: json['msg'] as String,
      type: json['type'] as String,
    );

Map<String, dynamic> _$ValidationErrorToJson(ValidationError instance) =>
    <String, dynamic>{
      'loc': instance.loc,
      'msg': instance.msg,
      'type': instance.type,
    };

HTTPValidationError _$HTTPValidationErrorFromJson(Map<String, dynamic> json) =>
    HTTPValidationError(
      detail: (json['detail'] as List<dynamic>?)
          ?.map((e) => ValidationError.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$HTTPValidationErrorToJson(
        HTTPValidationError instance) =>
    <String, dynamic>{
      'detail': instance.detail,
    };

ApiError _$ApiErrorFromJson(Map<String, dynamic> json) => ApiError(
      message: json['message'] as String,
      type: json['type'] as String?,
      detail: (json['detail'] as List<dynamic>?)
          ?.map((e) => ValidationError.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$ApiErrorToJson(ApiError instance) => <String, dynamic>{
      'message': instance.message,
      'type': instance.type,
      'detail': instance.detail,
    };
