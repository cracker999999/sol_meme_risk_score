// 风险权重定义
const RISK_WEIGHTS = {
  // 极高风险 - 建议直接过滤
  'NOT_SELLABLE': 100,             // 不可卖出（蜜罐）
  'NON_TRANSFERABLE': 90,          // 不可转账

  // 高风险 - 需要严格审查  
  'HAS_PERMANENT_DELEGATE': 80,    // 永久委托权限
  'HAS_FREEZE_AUTHORITY': 70,      // 冻结权限
  'MUTABLE_TRANSFER_FEES': 65,     // 可变转账费用
  'SUSPICIOUS_DEV_ACTIVITY': 60,   // 可疑开发者活动

  // 中等风险 - 需要避慎
  'HIGH_SINGLE_OWNERSHIP': 55,     // 单一地址持有过高
  'SUSPICIOUS_TOP_HOLDER_ACTIVITY': 55, // 可疑大户活动
  'HAS_MINT_AUTHORITY': 50,        // 铸币权限
  'HIGH_SUPPLY_CONCENTRATION': 45, // 供应高度集中

  // 低风险 - 信息提示
  'VERY_LOW_TRADING_ACTIVITY': 30, // 极低交易活动
  'LOW_LIQUIDITY': 25,             // 低流动性
  'NOT_VERIFIED': 20,              // 未验证
  'LOW_ORGANIC_ACTIVITY': 15,      // 低自然活动
  'NEW_LISTING': 10,               // 新上市
};

// 严重性权重乘数
const SEVERITY_MULTIPLIERS = {
  'critical': 2.0,
  'warning': 1.5,
  'info': 1.0
};

// API 调用配置
const API_CONFIG = {
  MAX_RETRIES: 2,
  TIMEOUT_MS: 15000,   // 减少超时时间到 15 秒
  RETRY_DELAY_MS: 1000, // 减少重试延迟到 1 秒
  CACHE_TTL: 300,      // 缓存时间 5 分钟
};

export default {
  async fetch(request) {
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    try {
      const url = new URL(request.url);
      console.log('Processing request for URL:', url.pathname);
      
      // 健康检查端点
      if (url.pathname === '/health') {
        return new Response(JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString()
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      // 风险评分端点
      const riskScoreMatch = url.pathname.match(/^\/api\/risk-score\/([^\/]+)$/);
      if (riskScoreMatch) {
        const mint = riskScoreMatch[1];
        console.log('Processing risk score for mint:', mint);
        
        // 调用 Jupiter Shield API
        const apiUrl = `https://lite-api.jup.ag/ultra/v1/shield?mints=${mint}`;
        console.log('Calling Jupiter Shield API:', apiUrl);
        
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Jupiter Shield API responded with status ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', JSON.stringify(data));
        
        // 处理警告信息
        const warnings = [];
        const mintWarnings = data?.warnings?.[mint] || [];

        for (const warning of mintWarnings) {
          if (!warning || !warning.type) continue;

          const severity = warning.type.includes('NOT_SELLABLE') ? 'critical' : 
                         warning.type.includes('PERMANENT') || warning.type.includes('FREEZE') ? 'warning' : 'info';
          
          warnings.push({
            type: warning.type,
            severity,
            message: warning.message || `${warning.type} risk detected`
          });
        }
        
        // 计算风险评分
        let totalScore = 0;
        for (const warning of warnings) {
          const baseWeight = RISK_WEIGHTS[warning.type] || 0;
          const severityMultiplier = SEVERITY_MULTIPLIERS[warning.severity] || 1;
          totalScore += baseWeight * severityMultiplier;
        }
        
        const riskScore = Math.min(Math.round(totalScore), 500);
        let riskLevel = 'INFO';
        if (riskScore >= 200) riskLevel = 'CRITICAL';
        else if (riskScore >= 100) riskLevel = 'WARNING';
        
        return new Response(JSON.stringify({
          mint,
          score: riskScore,
          level: riskLevel,
          warnings,
          timestamp: new Date().toISOString()
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': `public, max-age=${API_CONFIG.CACHE_TTL}`
          }
        });
      }
      
      // 404 处理
      return new Response(JSON.stringify({
        error: 'Not Found',
        path: url.pathname
      }), { 
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
      
    } catch (error) {
      console.error('Error processing request:', error);
      return new Response(JSON.stringify({
        error: error.message,
        path: new URL(request.url).pathname,
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};
