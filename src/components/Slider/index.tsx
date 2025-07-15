import React, { useEffect, useState, useRef } from 'react';
import { Dimensions, Image, ScrollView, Text, View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { scale } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FONTS } from '../../utils/fonts';
import { NEXT_PUBLIC_API_CDN_ENDPOINT } from '../../config/apiEndpoints';
import { COLORS } from '../../theme/colors';
import { useSelector } from 'react-redux';

const { width: screenWidth } = Dimensions.get('window');

interface SliderProps {
    sliderData: any[];
    bottomLiveBtn?: boolean;
    topbtn?: boolean;
    onImagePress?: (item: any) => void;
    imageKey?: string;
}

const Slider = ({ sliderData, bottomLiveBtn, topbtn,onImagePress, imageKey = "banner" }: SliderProps) => {
    const navigation = useNavigation();
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);
    const liveDotAnim = useRef(new Animated.Value(1)).current; // Create animated value for live dot scaling
    const handleScroll = (event: any) => {
        const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
        setActiveIndex(newIndex);
    };
    const isTablet = useSelector((state: RootState) => state.auth.isTablet);

    // Function to animate the live dot (zoom in and out)
    const animateLiveDot = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(liveDotAnim, {
                    toValue: 1.2, // Scale to 1.2 (zoom in)
                    duration: 500, // Duration for zoom in
                    useNativeDriver: true,
                }),
                Animated.timing(liveDotAnim, {
                    toValue: 0.9, // Scale back to 1 (zoom out)
                    duration: 500, // Duration for zoom out
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    useEffect(() => {
        // Start the animation when the component mounts
        animateLiveDot();

        const interval = setInterval(() => {
            const nextIndex = (activeIndex + 1) % sliderData?.length;
            setActiveIndex(nextIndex);
            scrollViewRef.current?.scrollTo({ x: screenWidth * nextIndex, animated: true });
        }, 3000);

        return () => {
            clearInterval(interval);
        };
    }, [activeIndex, sliderData?.length]);

    return (
        <View style={styles.sliderWrapper}>
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                ref={scrollViewRef}
                scrollEventThrottle={16}
            >
                {sliderData?.map((item, index) => {
                    return (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            key={index}
                            style={styles.sliderItem}
                            onPress={() => onImagePress?.(item)} // <- Add this line
                        >
                            <Image
                             source={{ uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${item?.[imageKey] || item?.banner}` }}
                             style={[styles.sliderImage,{
                                     width: '100%',
                                   height:isTablet ? scale(180) : scale(200),
                             }]}
                            />
                            {bottomLiveBtn && (
                                <View style={[topbtn ? styles.liveNowTopWrapper : styles.liveNoBtnWrapper,{
                                    paddingVertical:isTablet ? scale(2) : scale(5),
                                    paddingHorizontal: isTablet ? scale(5) : scale(10),
                                }]}>
                                    <Animated.View
                                        style={[
                                            styles.liveDot,
                                            
                                            { transform: [{ scale: liveDotAnim }],
                                            width: isTablet? scale(3) : scale(8),
                                            height:isTablet? scale(3) : scale(8), },
                                        ]}
                                    />
                                    <Text style={[styles.liveNowButtonText,{  fontSize:isTablet? scale(6):  scale(13),}]}>Live Now</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Pagination */}
            <View style={styles.pagination}>
                {sliderData.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            index === activeIndex ? styles.activeDot : styles.inactiveDot,
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    sliderWrapper: {
        // marginBottom: scale(10),
    },
    sliderItem: {
        width: screenWidth,
        overflow: 'hidden',
    },
    sliderImage: {
   
        resizeMode: 'cover',
    },
    liveNowTopWrapper: {
        position: 'absolute',
        top: scale(10),
        right: scale(10),
        backgroundColor: '#EA0101',
        flexDirection: 'row',
        alignItems: 'center',
    },
    liveNoBtnWrapper: {
        position: 'absolute',
        bottom: scale(10),
        left: scale(10),
        backgroundColor: '#EA0101',
        flexDirection: 'row',
        alignItems: 'center',
    },
    liveNowButtonWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: scale(10),
    },
    liveNowButton: {
        backgroundColor: '#EA0101',
        borderRadius: scale(5),
        paddingVertical: scale(10),
        paddingHorizontal: scale(20),
        flexDirection: 'row',
        alignItems: 'center',
    },
    liveNowButtonText: {
        color: COLORS.white,
        fontFamily: FONTS.montSemiBold,
    },
    liveDot: {
        borderRadius: scale(5),
        backgroundColor: COLORS.white,
        marginRight: scale(8),
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: scale(5),
        fontFamily: FONTS.montSemiBold,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 5,
        marginHorizontal: scale(5),
    },
    activeDot: {
        backgroundColor: COLORS.white,
        width: 15,
    },
    inactiveDot: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
});

export default Slider;
