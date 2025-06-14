import 'package:json_annotation/json_annotation.dart';

part 'species.g.dart';

/// 物种数据模型
/// 对应React项目中的SpeciesRead类型
@JsonSerializable()
class Species {
  /// 物种ID
  final int id;
  
  /// 目详情
  @JsonKey(name: 'order_details')
  final String orderDetails;
  
  /// 科详情
  @JsonKey(name: 'family_details')
  final String familyDetails;
  
  /// 属详情
  @JsonKey(name: 'genus_details')
  final String genusDetails;
  
  /// 中文名称
  @JsonKey(name: 'name_chinese')
  final String nameChinese;
  
  /// 英文名称
  @JsonKey(name: 'name_english')
  final String? nameEnglish;
  
  /// 拉丁名称
  @JsonKey(name: 'name_latin')
  final String? nameLatin;
  
  /// 链接
  final String? href;
  
  /// 完整拼音
  @JsonKey(name: 'pinyin_full')
  final String? pinyinFull;
  
  /// 拼音首字母
  @JsonKey(name: 'pinyin_initials')
  final String? pinyinInitials;

  const Species({
    required this.id,
    required this.orderDetails,
    required this.familyDetails,
    required this.genusDetails,
    required this.nameChinese,
    this.nameEnglish,
    this.nameLatin,
    this.href,
    this.pinyinFull,
    this.pinyinInitials,
  });

  factory Species.fromJson(Map<String, dynamic> json) => _$SpeciesFromJson(json);
  Map<String, dynamic> toJson() => _$SpeciesToJson(this);

  @override
  String toString() {
    return 'Species(id: $id, nameChinese: $nameChinese, nameEnglish: $nameEnglish, '
           'nameLatin: $nameLatin, orderDetails: $orderDetails)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Species && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
} 