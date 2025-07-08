<!-- Keep these links. Translations will automatically update with the README. -->
[Deutsch](https://www.readme-i18n.com/cracker999999/sol_meme_risk_score?lang=de) | 
[English](https://www.readme-i18n.com/cracker999999/sol_meme_risk_score?lang=en) | 
[Español](https://www.readme-i18n.com/cracker999999/sol_meme_risk_score?lang=es) | 
[français](https://www.readme-i18n.com/cracker999999/sol_meme_risk_score?lang=fr) | 
[日本語](https://www.readme-i18n.com/cracker999999/sol_meme_risk_score?lang=ja) | 
[한국어](https://www.readme-i18n.com/cracker999999/sol_meme_risk_score?lang=ko) | 
[Português](https://www.readme-i18n.com/cracker999999/sol_meme_risk_score?lang=pt) | 
[Русский](https://www.readme-i18n.com/cracker999999/sol_meme_risk_score?lang=ru)

# Solana Meme 风险评分系统

基于 Cloudflare Worker 构建的 Solana 代币风险评分系统，利用 Jupiter Ultra Shield API 进行风险评估。

## 特性

- ✅ 接入 Jupiter Ultra Shield API 获取代币风险标签
- ✅ 定义风险权重模型，对标签进行量化打分
- ✅ 应用加权求和机制，输出风险总评分（0-500）
- ✅ 自动分级（Critical / Warning / Info）
- ✅ 轻量级 API 服务
- ✅ CORS 支持，前端友好

## 开发

```bash
# Installation Dependency 
npm install

# Local dev
npm run dev

# Deploy to Cloudflare
npm run publish
```

## API 使用

### 获取代币风险评分

```
GET /api/risk-score/:mint

Example: /api/risk-score/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
```

### 响应示例

```json
{
  "mint": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "score": 280,
  "level": "CRITICAL",
  "warnings": [
    {
      "type": "NOT_SELLABLE",
      "severity": "critical",
      "message": "Token cannot be sold (Honeypot)"
    }
  ],
  "timestamp": "2025-06-16T10:00:00.000Z"
}
```

## 风险评分说明

总分范围：0-500分，分数越高风险越大。

### 风险等级
- CRITICAL (≥200分)：极高风险，建议避免
- WARNING (≥100分)：高风险，需谨慎
- INFO (<100分)：低风险，供参考

### 主要风险类型权重
- 不可卖出（蜜罐）: 100分
- 不可转账: 90分
- 永久委托权限: 80分
- 冻结权限: 70分
- 可疑开发者活动: 60分
