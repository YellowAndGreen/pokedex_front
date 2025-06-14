// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'species.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Species _$SpeciesFromJson(Map<String, dynamic> json) => Species(
      id: (json['id'] as num).toInt(),
      orderDetails: json['order_details'] as String,
      familyDetails: json['family_details'] as String,
      genusDetails: json['genus_details'] as String,
      nameChinese: json['name_chinese'] as String,
      nameEnglish: json['name_english'] as String?,
      nameLatin: json['name_latin'] as String?,
      href: json['href'] as String?,
      pinyinFull: json['pinyin_full'] as String?,
      pinyinInitials: json['pinyin_initials'] as String?,
    );

Map<String, dynamic> _$SpeciesToJson(Species instance) => <String, dynamic>{
      'id': instance.id,
      'order_details': instance.orderDetails,
      'family_details': instance.familyDetails,
      'genus_details': instance.genusDetails,
      'name_chinese': instance.nameChinese,
      'name_english': instance.nameEnglish,
      'name_latin': instance.nameLatin,
      'href': instance.href,
      'pinyin_full': instance.pinyinFull,
      'pinyin_initials': instance.pinyinInitials,
    };
