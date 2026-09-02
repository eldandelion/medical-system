import { useQuery } from '@tanstack/react-query';
import { dictionaryApi, type EthnicityDto } from '../api/dictionaries';

export const STANDARD_ETHNICITY_NAMES: string[] = [
  '汉族', '蒙古族', '回族', '藏族', '维吾尔族', '苗族', '彝族', '壮族', '布依族', '朝鲜族',
  '满族', '侗族', '瑶族', '白族', '土家族', '哈尼族', '哈萨克族', '傣族', '黎族', '傈僳族',
  '佤族', '畲族', '高山族', '拉祜族', '水族', '东乡族', '纳西族', '景颇族', '柯尔克孜族', '土族',
  '达斡尔族', '仫佬族', '羌族', '布朗族', '撒拉族', '毛南族', '仡佬族', '锡伯族', '阿昌族', '普米族',
  '塔吉克族', '怒族', '乌孜别克族', '俄罗斯族', '鄂温克族', '德昂族', '保安族', '裕固族', '京族', '塔塔尔族',
  '独龙族', '鄂伦春族', '赫哲族', '门巴族', '珞巴族', '基诺族', '其他'
];

export const FALLBACK_ETHNICITIES: EthnicityDto[] = STANDARD_ETHNICITY_NAMES.map((name, idx) => ({
  id: idx + 1,
  name,
}));

export function useEthnicities() {
  const query = useQuery({
    queryKey: ['dictionaries', 'ethnicities'],
    queryFn: dictionaryApi.fetchEthnicities,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    placeholderData: FALLBACK_ETHNICITIES,
  });

  return {
    ethnicities: query.data ?? FALLBACK_ETHNICITIES,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
