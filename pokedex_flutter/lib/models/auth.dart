import 'package:json_annotation/json_annotation.dart';

part 'auth.g.dart';

/// 认证响应模型
/// 对应OpenAPI文档中的认证响应
@JsonSerializable()
class AuthResponse {
  /// 访问令牌
  @JsonKey(name: 'access_token')
  final String accessToken;
  
  /// 令牌类型
  @JsonKey(name: 'token_type')
  final String tokenType;
  
  /// 过期时间（可选）
  @JsonKey(name: 'expires_in')
  final int? expiresIn;

  const AuthResponse({
    required this.accessToken,
    required this.tokenType,
    this.expiresIn,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) => _$AuthResponseFromJson(json);
  Map<String, dynamic> toJson() => _$AuthResponseToJson(this);

  @override
  String toString() {
    return 'AuthResponse(accessToken: ${accessToken.substring(0, 10)}..., '
           'tokenType: $tokenType, expiresIn: $expiresIn)';
  }
}

/// 发送验证码请求模型
@JsonSerializable()
class VerificationRequest {
  /// 邮箱地址
  final String email;

  const VerificationRequest({
    required this.email,
  });

  factory VerificationRequest.fromJson(Map<String, dynamic> json) => _$VerificationRequestFromJson(json);
  Map<String, dynamic> toJson() => _$VerificationRequestToJson(this);

  @override
  String toString() {
    return 'VerificationRequest(email: $email)';
  }
}

/// 验证码登录请求模型
@JsonSerializable()
class VerifyCodeRequest {
  /// 邮箱地址
  final String email;
  
  /// 验证码
  final String code;

  const VerifyCodeRequest({
    required this.email,
    required this.code,
  });

  factory VerifyCodeRequest.fromJson(Map<String, dynamic> json) => _$VerifyCodeRequestFromJson(json);
  Map<String, dynamic> toJson() => _$VerifyCodeRequestToJson(this);

  @override
  String toString() {
    return 'VerifyCodeRequest(email: $email, code: [HIDDEN])';
  }
}

/// 验证错误模型
/// 对应OpenAPI文档中的ValidationError
@JsonSerializable()
class ValidationError {
  /// 错误位置
  final List<dynamic> loc;
  
  /// 错误消息
  final String msg;
  
  /// 错误类型
  final String type;

  const ValidationError({
    required this.loc,
    required this.msg,
    required this.type,
  });

  factory ValidationError.fromJson(Map<String, dynamic> json) => _$ValidationErrorFromJson(json);
  Map<String, dynamic> toJson() => _$ValidationErrorToJson(this);

  @override
  String toString() {
    return 'ValidationError(loc: $loc, msg: $msg, type: $type)';
  }
}

/// HTTP验证错误响应模型
/// 对应OpenAPI文档中的HTTPValidationError
@JsonSerializable()
class HTTPValidationError {
  /// 错误详情列表
  final List<ValidationError>? detail;

  const HTTPValidationError({
    this.detail,
  });

  factory HTTPValidationError.fromJson(Map<String, dynamic> json) => _$HTTPValidationErrorFromJson(json);
  Map<String, dynamic> toJson() => _$HTTPValidationErrorToJson(this);

  @override
  String toString() {
    return 'HTTPValidationError(detail: $detail)';
  }
}

/// API错误模型
/// 对应OpenAPI文档中的错误响应格式
@JsonSerializable()
class ApiError {
  /// 错误消息
  final String message;
  
  /// 错误类型
  final String? type;
  
  /// 验证错误详情
  final List<ValidationError>? detail;

  const ApiError({
    required this.message,
    this.type,
    this.detail,
  });

  factory ApiError.fromJson(Map<String, dynamic> json) => _$ApiErrorFromJson(json);
  Map<String, dynamic> toJson() => _$ApiErrorToJson(this);

  @override
  String toString() {
    return 'ApiError(message: $message, type: $type, detailCount: ${detail?.length ?? 0})';
  }
}

/// 保留兼容性的TokenResponse别名
typedef TokenResponse = AuthResponse; 