import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  StyleSheet,
  Platform,
  Pressable,
  TVEventHandler,
} from 'react-native';
import moment from 'moment-timezone';
 // updated styles for TV environment
import Header from '../../components/Header';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { scale } from 'react-native-size-matters';
import { COLORS } from '../../theme/colors';
import apiHelper from '../../config/apiHelper';
import TimeZone from 'react-native-timezone';
import {
  NEXT_PUBLIC_API_CDN_ENDPOINT,
  TV_GUIDE,
  TRENDING_VIDEOS,
} from '../../config/apiEndpoints';
import styles from './styles';

const TVGuideScreen = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tvPrograms, setTvPrograms] = useState([]);
  const scrollViewRef = useRef(null);
  const [currentTimePosition, setCurrentTimePosition] = useState(0);
  const isTablet = useSelector((state: any) => state.auth.isTablet);
  const loading = useState(false);
  const screenWidth = Dimensions.get('window').width;
  const timeSlotWidth = 120;

  const timeSlots = Array.from({ length: 49 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return i === 48 ? '00:00' : `${String(hour).padStart(2, '0')}:${minute}`;
  });

  const weekRange = Array.from({ length: 15 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 7 + i);
    const label = date.toDateString() === new Date().toDateString()
      ? 'Today' : date.toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric'
      });
    return { date, label };
  });

  const fetchTVGuideData = useCallback(async (selected) => {
    try {
      const timezone = await TimeZone.getTimeZone();
      const formattedDate = selected.toISOString().split('T')[0];
      const res = await apiHelper.get(
        `${TV_GUIDE}?date=${formattedDate}`,
        {},
        { headers: { timezone } }
      );

      if (res?.status === 200 && Array.isArray(res?.data?.data)) {
        const fetchedPrograms = res.data.data.map(channel => ({
          id: channel._id,
          name: channel.name,
          logo: {
            uri: `${NEXT_PUBLIC_API_CDN_ENDPOINT}${channel.tvGuideChannelLogo}`
          },
          programs: Array.isArray(channel.shows) ? channel.shows.map(show => ({
            id: show._id,
            name: show.name,
            startTime: new Date(show.startTime),
            endTime: new Date(show.endTime),
          })) : [],
        }));
        setTvPrograms(fetchedPrograms);
      }
    } catch (e) {
      console.error('TV Guide Fetch Error:', e);
    }
  }, []);

  useEffect(() => {
    fetchTVGuideData(selectedDate);
  }, [selectedDate]);

  const updateLivePosition = () => {
    const now = moment();
    const currentMinutes = now.hours() * 60 + now.minutes();
    const fullMinutes = 24 * 60;
    const totalWidth = timeSlots.length * timeSlotWidth;
    const pos = (currentMinutes / fullMinutes) * totalWidth;
    setCurrentTimePosition(Math.min(pos, totalWidth - 2));
  };

  useEffect(() => {
    updateLivePosition();
    const interval = setInterval(updateLivePosition, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleShowPress = async (showId) => {
    try {
      const res = await apiHelper.get(`${TRENDING_VIDEOS}/${showId}`);
      if (res?.data) {
        const tvData = res.data;
        const videoUri = tvData.type === 'VOD'
          ? `${NEXT_PUBLIC_API_CDN_ENDPOINT}/${tvData?.episode?.video}`
          : tvData?.rtmp?.primary;

        navigation.navigate('VideoPlayerScreen', {
          videoUri,
          streamName: tvData?.name,
        });
      }
    } catch (e) {
      console.error('Show press failed', e);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="TV Guide"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      {/* Date Selector */}
      <View style={styles.dateSelector}>
        <FlatList
          data={weekRange}
          horizontal
          keyExtractor={(item) => item.date.toDateString()}
          renderItem={({ item }) => {
            const isSelected = item.date.toDateString() === selectedDate.toDateString();
            return (
              <Pressable
                onPress={() => setSelectedDate(item.date)}
                focusable={true}
                isTVSelectable
                style={[
                  styles.dateItem,
                  isSelected && styles.selectedDateItem
                ]}
              >
                <Text style={styles.dateText}>{item.label}</Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* TV Program Guide */}
      <View style={styles.guideContainer}>
        <ScrollView
          horizontal
          ref={scrollViewRef}
          showsHorizontalScrollIndicator={false}
        >
          <View>
            {/* Time slots */}
            <View style={styles.timeSlotContainer}>
              {timeSlots.map((slot, index) => (
                <View key={index} style={{ width: timeSlotWidth }}>
                  <Text style={styles.timeSlotText}>{slot}</Text>
                </View>
              ))}
            </View>

            {/* Live Time Indicator */}
            <View style={[
              styles.nowIndicator,
              { left: currentTimePosition }
            ]} />

            {/* Program Rows */}
            {tvPrograms.map((channel) => (
              <View key={channel.id} style={styles.programRow}>
                {channel.programs.map((program, index) => {
                  const startM = moment(program.startTime).hours() * 60 + moment(program.startTime).minutes();
                  const endM = moment(program.endTime).hours() * 60 + moment(program.endTime).minutes();
                  const blockWidth = ((endM - startM) / 30) * timeSlotWidth;
                  return (
                    <Pressable
                      key={index}
                      focusable
                      isTVSelectable
                      hasTVPreferredFocus={index === 0}
                      style={[styles.programBlock, { width: blockWidth }]}
                      onPress={() => handleShowPress(program.id)}
                    >
                      <Text numberOfLines={2} style={styles.programText}>
                        {program.name}
                      </Text>
                      <Text style={styles.programText}>
                        {moment(program.startTime).format('HH:mm')} - {moment(program.endTime).format('HH:mm')}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Channel Logos */}
        <ScrollView style={styles.channelList}>
          {tvPrograms.map((channel) => (
            <View key={channel.id} style={styles.channelItem}>
              <Image source={channel.logo} style={styles.channelLogo} />
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default TVGuideScreen;
