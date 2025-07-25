import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IMAGES } from '../../theme/images'; // Update with your images if necessary
import { COLORS } from '../../theme/colors';
import { scale, verticalScale } from 'react-native-size-matters';
import apiHelper from '../../config/apiHelper'; // Assuming you have apiHelper to fetch data
import CHeader from '../../components/CHeader'; // Assuming custom header component
import AlertModal from '../../components/AlertModal'; // Custom Modal
import Header from '../../components/Header';
import CAlertModal from '../../components/CAlertModal';
import { AVTAR_LIST, NEXT_PUBLIC_API_CDN_ENDPOINT } from '../../config/apiEndpoints';
import styles from './styles';
import { useSelector } from 'react-redux';

interface Avatar {
    _id: string;
    imageUrl: string; // Modify according to your API response structure
}
interface SelectAvatarProps {
    navigation: any;
    route: any;
}


const SelectAvatar: React.FC<SelectAvatarProps> = ({ navigation, route }) => {
    const [isLoading, setIsLoading] = useState(true);
    const dataFetchedRef = useRef(false);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState<string>('');
    const [alertType, setAlertType] = useState<'success' | 'error'>('success');
    // const [alertType, setAlertType] = useState<'success' | 'failure'>('failure');
    const [avatarData, setAvatarData] = useState<Avatar[]>([]);
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(route?.params?.avatar || null); // Set the avatar if passed
    // Fetch avatar list from API
      const isTablet = useSelector((state: RootState) => state.auth.isTablet);

    const fetchAvatars = async () => {
        try {
            const response = await apiHelper.get(AVTAR_LIST);
            setAvatarData(response?.data); // Assuming the API returns an array of avatars
        } catch (error) {
            setAlertMessage('Failed to fetch avatars');
            setAlertType('error');
            setIsModalVisible(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (dataFetchedRef.current) return;
        dataFetchedRef.current = true;
        fetchAvatars();
    }, []);




    const handleAvatarSelect = async (avatarId: string) => {
        setSelectedAvatar(avatarId);
        // Navigate back to AddProfile screen with the selected avatar
        navigation.navigate('AddProfile', {
            avatar: avatarId, // Pass selected avatar
            name: route.params?.name || '',
            isKidsProfile: route.params?.isKidsProfile || false,
            // mode: route.params?.mode || 'add',
            profileId: route?.params?.profileId,
            defaultProfile: route.params?.defaultProfile,
        });
    };



    const renderItem = ({ item }: { item: Avatar }) => {
        const isSelected = item._id === selectedAvatar;
        return (
            <TouchableOpacity
                style={{
                       marginVertical: isTablet ? scale(3) : scale(5),
                      marginHorizontal:  isTablet ? scale(3) : scale(5),
                }}
                // style={[styles.avatarCard, isSelected && styles.selectedAvatarCard]}
                onPress={() => handleAvatarSelect(item._id)}
            >
                <Image
                    source={{ uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${item?._id}` }}
                    // style={[styles.avatarImage,{isSelected}]}
                    style={[styles.avatarImage, { borderColor: isSelected ? COLORS.primary : COLORS.greyBorder,
                          width:isTablet ? scale (50) : scale(100),
                         height:isTablet ? scale (50) : scale(100),
                     }]}
                />
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Header
                title="Select Avatar"
                showBackButton
                onBackPress={() => navigation.goBack()}
                showSearchIcon={false}
                bgCOlor={isModalVisible ? true : false} />

            {isLoading ? (
                <View style={{flex:1,justifyContent:'center'}}>
                <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
                </View>
            ) : (
                <FlatList
                    style={styles.listStyl}
                    contentContainerStyle={{ flexGrow: 1 }}
                    data={avatarData}
                    renderItem={renderItem}
                    keyExtractor={(item) => item?._id}
                    numColumns={3}
                    showsVerticalScrollIndicator={false}
                />
            )}
            <CAlertModal
                visible={isModalVisible}
                btnTitle="OK"
                type={alertType}
                message={alertMessage}
                onOkPress={() => setIsModalVisible(false)}
            />

        </View>
    );
};


export default SelectAvatar;
