'use client';

import { useTRPCClient } from '@/lib/trpc';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import PropertyCard from './PropertyCard';
import Section from './Section';

const UNIVERSITIES = ['UNSW', 'USYD', 'UTS'] as const;

export default function PropertyGrid() {
  const t = useTranslations('PropertyGrid');
  const [selectedUniversity, setSelectedUniversity] = useState<string>('UNSW');
  const trpc = useTRPCClient();
  const queryClient = useQueryClient();
  const { user, isLoading } = useAuth();

  const { data, isPending, error } = useQuery({
    queryKey: ['pgs.list', selectedUniversity, user?.id],
    queryFn: () =>
      trpc.pgs.list.query({
        pageSize: 8,
        page: 1,
      } as any),
    enabled: !isLoading,
  });

  // @Deprecated: 后端应该直接返回房源状态
  // // 获取用户收藏列表
  // const { data: subscriptions, isLoading: subscriptionsLoading } = useQuery({
  //   queryKey: ['properties.getSubscriptions'],
  //   queryFn: () => trpc.properties.getSubscriptions.query(),
  //   enabled: typeof window !== 'undefined' && !!localStorage.getItem('auth-token'),
  //   // initialData: getCachedSubscriptions(), // 注释掉：localStorage缓存会造成多端不一致
  // });

  // // 创建收藏 ID 的 Set 用于快速查找
  // const subscribedPropertyIds = new Set(subscriptions?.map((sub: Subscription) => sub.id) || []);

  // 当 subscriptions 更新时，保存到 localStorage
  // 注释掉：localStorage缓存会造成多端不一致
  // useEffect(() => {
  //   if (typeof window !== 'undefined' && subscriptions && subscriptions.length >= 0) {
  //     localStorage.setItem(SUBSCRIPTIONS_CACHE_KEY, JSON.stringify(subscriptions));
  //   }
  // }, [subscriptions]);

  const getUniversityColors = (school: string, isSelected: boolean) => {
    const colors: Record<string, { selected: string; hover: string }> = {
      UNSW: {
        selected: 'bg-yellow-400 text-black',
        hover: 'hover:bg-yellow-100 hover:text-yellow-800',
      },
      USYD: {
        selected: 'bg-blue-800 text-yellow-400',
        hover: 'hover:bg-blue-100 hover:text-blue-800',
      },
      UTS: {
        selected: 'bg-blue-500 text-orange-400',
        hover: 'hover:bg-blue-100 hover:text-blue-600',
      },
    };

    return isSelected
      ? colors[school]?.selected || 'bg-blue-600 text-white'
      : colors[school]?.hover || 'hover:text-blue-600';
  };

  const sectionTitle = (
    <div className="flex flex-wrap justify-center items-center gap-3">
      <span>{t('dailyNewHouses')}</span>
      <div className="flex flex-wrap rounded-lg border border-slate-200 bg-slate-50">
        {UNIVERSITIES.map(school => (
          <button
            key={school}
            onClick={() => setSelectedUniversity(school)}
            className={`px-3 py-2 transition-colors rounded-md ${
              selectedUniversity === school
                ? `${getUniversityColors(school, true)} shadow-sm`
                : getUniversityColors(school, false)
            }`}
          >
            {school}
          </button>
        ))}
      </div>
    </div>
  );

  if (isPending) {
    return (
      <Section title={sectionTitle}>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <div className="p-4 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-2/3" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </Section>
    );
  }

  if (error) {
    return (
      <Section title={sectionTitle}>
        <div className="text-center py-8">
          <p className="text-slate-600">{t('loadError')}</p>
        </div>
      </Section>
    );
  }

  const properties: any[] = data?.pgs || [];

  // 🔥 在前端按评分降序排序(从高到低)
  const sortedProperties = [...properties].sort((a, b) => {
    return (b.averageScore || 0) - (a.averageScore || 0);
  });

  return (
    <Section title={sectionTitle}>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedProperties.map((property: any) => (
          <PropertyCard
            id={property.id}
            propertyId={property.id}
            key={property.id}
            address={property.address}
            region={property.locality || property.city || property.college?.name || ''}
            price={property.minRent}
            bedroomCount={property.rooms?.length || 1}
            bathroomCount={1}
            propertyType={1}
            commuteTime={property.commuteTimeMins || undefined}
            url={`/pg/${property.id}`}
            thumbnailUrl={property.photos?.[0]?.url || '/placeholder.png'}
            subscribed={false}
            averageScore={property.averageRating || 4.5}
            keywords={`${property.genderRestriction} • ${property.foodType}`}
            publishedAt={new Date(property.createdAt).toISOString()}
          />
        ))}
      </div>
    </Section>
  );
}