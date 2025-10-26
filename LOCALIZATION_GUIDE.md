# 🌐 한글화 가이드

## 현재 상태

### ✅ 완료된 부분 (약 30%)

**번역 시스템:**
- ✅ i18n 설정 완료 (`src/i18n/config.ts`)
- ✅ 언어 전환 UI (우측 상단 🌐 아이콘)
- ✅ 6개 번역 파일 생성 (총 500+ 번역 키)
  - common.json - 공통 UI 텍스트
  - navigation.json - 네비게이션 메뉴
  - categories.json - 카테고리명
  - forms.json - 폼 및 검증
  - admin.json - 관리자 페이지
  - pages.json - 페이지별 텍스트

**번역 완료 컴포넌트:**
- ✅ Navigation - 전체 메뉴, 버튼, 드롭다운
- ✅ Footer - 모든 링크, 뉴스레터
- ✅ HeroSection - 타이틀, 검색
- ✅ Categories - 카테고리 카드
- ✅ Stats - 통계 섹션
- ✅ FilterBar - 필터, 정렬
- ✅ SearchDialog - 검색 다이얼로그
- ✅ SubmitToolModal - 도구 제출 폼
- ✅ AdminLayout - 관리자 사이드바
- ✅ LanguageSwitcher - 언어 전환

**백엔드:**
- ✅ DB 모델에 _ko 필드 추가
- ✅ API 에러 메시지 한글화
- ✅ 언어 감지 시스템

---

## 📝 페이지 번역 적용 방법

### 1. useTranslation Hook 추가

```typescript
// Before
import { useState } from 'react';

export function MyPage() {
  return <h1>Welcome</h1>;
}

// After
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function MyPage() {
  const { t } = useTranslation('pages');
  return <h1>{t('myPage.welcome')}</h1>;
}
```

### 2. 번역 키 추가

`src/i18n/locales/ko/pages.json`에 번역 키 추가:

```json
{
  "myPage": {
    "welcome": "환영합니다",
    "subtitle": "부제목"
  }
}
```

### 3. useLocalizedContent Hook 사용 (API 데이터용)

```typescript
import { useLocalizedContent } from '@/hooks/useLocalizedContent';

export function ToolCard({ tool }: { tool: Tool }) {
  const { getLocalizedField, getCategory } = useLocalizedContent();
  
  return (
    <div>
      <h2>{getLocalizedField(tool, 'name')}</h2>
      <p>{getLocalizedField(tool, 'description')}</p>
      <Badge>{getCategory(tool.category)}</Badge>
    </div>
  );
}
```

---

## 🔧 남은 번역 작업

### 우선순위 높음 (사용자가 자주 보는 페이지)

1. **Dashboard.tsx** - 사용자 대시보드
   - 탭 제목: "My Tools", "Favorites", "Submissions", "Purchases"
   - Welcome 메시지
   - 버튼: "Edit Profile", "Save Changes"

2. **AIToolDetail.tsx** - 도구 상세 페이지
   - "Visit Website", "Add to Favorites"
   - "Features", "Pricing", "Reviews"

3. **advertise.tsx** - 광고 페이지
   - 플랜 설명, 가격 정보

4. **top-products.tsx**, **trending.tsx**, **upcoming.tsx**
   - 페이지 제목 및 설명

### 우선순위 중간 (정보 페이지)

5. **about.tsx** - 소개 페이지
6. **faq.tsx** - FAQ
7. **Privacy.tsx** - 개인정보 처리방침
8. **Terms.tsx** - 이용약관
9. **blog.tsx**, **latest-news.tsx**

### 우선순위 낮음 (관리자 전용)

10. **admin/*** - 모든 관리자 페이지들

---

## 📦 빠른 적용 템플릿

### Dashboard 탭 번역:

```typescript
// src/pages/Dashboard.tsx
import { useTranslation } from 'react-i18next';

function Dashboard() {
  const { t } = useTranslation('pages');
  
  return (
    <Tabs>
      <TabsList>
        <TabsTrigger value="tools">{t('dashboard.myTools')}</TabsTrigger>
        <TabsTrigger value="favorites">{t('dashboard.favorites')}</TabsTrigger>
        <TabsTrigger value="submissions">{t('dashboard.mySubmissions')}</TabsTrigger>
        <TabsTrigger value="purchases">{t('dashboard.myPurchases')}</TabsTrigger>
        <TabsTrigger value="settings">{t('dashboard.settings')}</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
```

### 페이지 제목 번역:

```typescript
<h1>{t('pages:about.heading')}</h1>
<p>{t('pages:about.subtitle')}</p>
```

### 버튼 번역:

```typescript
<Button>{t('common:save')}</Button>
<Button>{t('common:cancel')}</Button>
<Button>{t('common:edit')}</Button>
```

---

## 🎯 자동 번역 스크립트

대량의 텍스트를 빠르게 번역하려면:

### 1. i18next-scanner 설치 (선택사항)

```bash
npm install -D i18next-scanner
```

### 2. 누락된 번역 키 자동 추출

```bash
npx i18next-scanner --config i18next-scanner.config.js
```

---

## ✅ 번역 완료 체크리스트

### 컴포넌트
- [x] Navigation
- [x] Footer
- [x] HeroSection
- [x] Categories
- [x] Stats
- [x] FilterBar
- [x] SearchDialog
- [x] SubmitToolModal
- [x] AdminLayout
- [x] LanguageSwitcher
- [ ] ProductCard
- [ ] ReviewForm
- [ ] ReviewList
- [ ] home/Newsletter
- [ ] home/Testimonials

### 페이지
- [ ] Index.tsx (90% 완료 - HeroSection 사용)
- [ ] Dashboard.tsx (번역 키 준비됨)
- [ ] AIToolDetail.tsx (번역 키 준비됨)
- [ ] advertise.tsx
- [ ] about.tsx
- [ ] faq.tsx
- [ ] Privacy.tsx
- [ ] Terms.tsx
- [ ] blog.tsx
- [ ] latest-news.tsx

### 관리자 페이지
- [x] AdminLayout (사이드바만)
- [ ] DashboardPage
- [ ] ToolsManagementPage
- [ ] UsersManagementPage
- [ ] BlogManagementPage
- [ ] NewsManagementPage
- [ ] 기타 관리자 페이지들

---

## 🚀 다음 단계

1. **번역 키가 준비된 페이지들에 적용**
   - Dashboard, AIToolDetail, advertise 등
   
2. **API 응답 데이터에 useLocalizedContent 적용**
   - 도구 이름, 설명, 카테고리 자동 한글 표시

3. **남은 페이지들 순차적으로 번역**

4. **테스트 및 QA**
   - 레이아웃 깨짐 확인
   - 번역 누락 확인
   - 문맥에 맞는지 검토

