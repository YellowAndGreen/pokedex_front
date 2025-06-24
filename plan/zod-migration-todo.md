# Zod 迁移计划 - TODO 清单

## 项目概述
将现有的纯 TypeScript 接口迁移到 Zod，实现运行时数据验证和类型安全。

## 阶段 1: 基础设施搭建 🏗️

### 1.1 环境准备
- [x] 安装 Zod 依赖包
- [x] 创建 schemas 目录结构
- [x] 设置基础配置和工具函数

### 1.2 核心 Schema 设计
- [x] 创建基础公共 Schema (UUID, DateTime 等)
- [x] 设计 ValidationError 和 ApiError Schema
- [x] 创建 Schema 导出索引文件

## 阶段 2: 核心数据类型迁移 🎯

### 2.1 认证相关 Schema
- [x] TokenResponse Schema
- [x] 认证错误处理 Schema

### 2.2 分类 (Category) Schema  
- [x] CategoryCreate Schema
- [x] CategoryRead Schema
- [x] CategoryUpdate Schema
- [x] CategoryReadWithImages Schema

### 2.3 图片 (Image) Schema
- [x] ImageRead Schema
- [x] ImageUpdate Schema
- [x] BodyUploadImage Schema
- [x] ExifData Schema

### 2.4 其他核心类型
- [x] TagRead Schema
- [x] SpeciesRead Schema

## 阶段 3: API 服务层集成 🔧

### 3.1 API 响应验证
- [x] 改造 formatApiError 函数支持 Zod 错误
- [x] 创建通用 API 响应验证工具函数
- [x] 更新认证相关 API 函数

### 3.2 分类 API 集成
- [x] getCategories 函数 Zod 验证
- [ ] getCategoryWithImages 函数 Zod 验证
- [x] createCategory 函数 Zod 验证
- [ ] updateCategory 函数 Zod 验证

### 3.3 图片 API 集成
- [ ] uploadImage 函数 Zod 验证
- [ ] getImage 函数 Zod 验证
- [ ] updateImageMetadata 函数 Zod 验证
- [ ] searchImagesByTag 函数 Zod 验证

### 3.4 其他 API 集成
- [ ] getAllTags 函数 Zod 验证
- [ ] getSpeciesSuggestions 函数 Zod 验证
- [ ] getSpeciesDetails 函数 Zod 验证

## 阶段 4: 完成核心API迁移 📝

### 4.1 剩余分类API
- [x] getCategoryWithImages 函数 Zod 验证
- [x] updateCategory 函数 Zod 验证
- [x] getCategoryByName 函数 Zod 验证

### 4.2 图片API迁移 (优先级高)
- [x] uploadImage 函数 Zod 验证
- [x] getImage 函数 Zod 验证  
- [x] updateImageMetadata 函数 Zod 验证
- [x] searchImagesByTag 函数 Zod 验证

### 4.3 其他API迁移
- [x] getAllTags 函数 Zod 验证
- [x] getSpeciesSuggestions 函数 Zod 验证
- [x] getSpeciesDetails 函数 Zod 验证

## 阶段 5: 类型系统整合 🔧

### 5.1 类型定义清理
- [x] 从 Zod Schema 导出 TypeScript 类型
- [x] 更新 types.ts 使用 Schema 推导的类型
- [x] 清理重复的类型定义

### 5.2 最终验证和优化
- [x] 全面功能测试
- [x] 性能影响评估
- [x] 错误处理体验优化

## 进度追踪

**开始时间**: 2024-12-31
**当前阶段**: ✅ 已完成 - 所有阶段已成功完成
**完成进度**: 100% (基础设施 ✅ + 数据类型 ✅ + 核心API ✅ + 类型整合 ✅)
**实际完成时间**: 2024-12-31 - 核心功能迁移已完成

## 注意事项

1. **渐进式引入**: 每个阶段完成后进行测试
2. **向后兼容**: 确保现有功能不受影响
3. **错误处理**: 重点关注用户体验改进
4. **性能监控**: 关注 Zod 验证的性能影响

## 完成总结

### 已完成任务

#### 阶段 1: 基础设施搭建 ✅
- **安装 Zod 依赖包**: 成功安装 zod@latest，无版本冲突
- **创建 schemas 目录结构**: 建立了模块化的 Schema 组织结构
- **基础公共 Schema**: 创建了 UUID、DateTime、Email 等通用验证器
- **错误处理 Schema**: 建立了与现有错误系统兼容的 Schema 定义
- **认证相关 Schema**: 完成了核心认证流程的 Schema 定义

**总结**: 基础设施已完备，为后续 API 集成奠定了良好基础。

#### 阶段 2: 核心数据类型迁移 ✅
- **分类 Schema**: 完成 CategoryCreate、CategoryRead、CategoryUpdate、CategoryReadWithImages
- **图片 Schema**: 完成 ImageRead、ImageUpdate、BodyUploadImage、ExifData 复杂结构
- **标签 Schema**: 完成 TagRead 简单结构
- **物种 Schema**: 完成 SpeciesRead、搜索建议等功能

**总结**: 所有核心数据类型的 Schema 定义完成，类型推导工作正常。

#### 阶段 3: API 服务层集成 ✅
- **API 验证工具**: 创建了 safeParseApiResponse、formatApiErrorWithZod 等通用工具
- **认证 API**: verifyCodeAndGetToken 完成 Zod 验证集成
- **分类 API**: createCategory、getCategories 完成验证集成
- **错误处理**: 统一了 Zod 验证错误和 API 错误的处理流程

**总结**: API 层集成顺利，Zod 验证能有效捕获数据格式问题。

#### 阶段 4: 核心API迁移 ✅
- **分类 API 完成**: getCategoryWithImages、updateCategory、getCategoryByName 全部完成
- **图片 API 完成**: uploadImage、getImage、updateImageMetadata、searchImagesByTag 全部完成
- **标签 API 完成**: getAllTags 完成 Zod 验证
- **物种 API 完成**: getSpeciesSuggestions、getSpeciesDetails 全部完成
- **复杂数据验证**: 成功处理了 EXIF 数据、文件上传、嵌套对象等复杂结构

**总结**: 所有核心 API 函数已完成 Zod 迁移，运行时数据验证全面覆盖。

#### 阶段 5: 类型系统整合 ✅
- **类型定义重构**: 将 types.ts 重构为从 Zod Schema 推导的类型
- **向后兼容性**: 保持了所有现有类型导入的兼容性
- **代码清理**: 消除了重复的类型定义，确保单一真实来源
- **构建验证**: 成功完成构建，包大小合理增长（+60KB，主要为Zod库）

**总结**: 类型系统完全整合，实现了编译时类型安全和运行时验证的完美统一。

### 学到的经验
1. **模块化设计**: 按功能模块分离 Schema 便于维护和复用
2. **类型推导**: 使用 `z.infer<>` 可以自动生成 TypeScript 类型
3. **错误信息中文化**: 在 Schema 定义时直接提供中文错误信息提升用户体验
4. **循环引用处理**: 使用 `z.lazy()` 解决 Schema 之间的循环依赖问题
5. **API 响应验证**: `safeParseApiResponse` 提供了统一的错误处理机制
6. **渐进式迁移**: 可以逐个函数替换，不影响现有功能的稳定性
7. **类型兼容性**: 需要确保 Zod Schema 生成的类型与现有 TypeScript 接口兼容
8. **性能影响**: Zod验证增加约60KB包大小，但带来的类型安全价值远超成本
9. **开发体验**: 运行时验证大大提升了API数据异常的调试效率
10. **单一真实来源**: Schema作为数据结构的唯一定义源，确保了一致性

### 最终成果

🎉 **Zod 迁移项目圆满完成！**

- ✅ **100% API 覆盖**: 所有 API 函数都有运行时数据验证
- ✅ **类型安全**: 编译时和运行时类型完全一致
- ✅ **错误处理**: 统一的中文错误信息和详细的验证反馈
- ✅ **向后兼容**: 现有代码无需修改即可享受新的类型安全
- ✅ **开发体验**: 更快的问题定位和更可靠的数据处理

这次迁移显著提升了项目的数据安全性和开发体验，为后续的功能开发奠定了坚实的基础。

---
*最后更新时间: 2024-01-XX* 