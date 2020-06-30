import Taro, { Component } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import './index.scss';
import ImageCropper from '../../components/ImageCropper';

export default class Index extends Component {
	componentWillMount() {}

	componentDidMount() {}

	componentWillUnmount() {}

	componentDidShow() {}

	componentDidHide() {}

	config = {
		navigationBarTitleText: '首页',
	};

	render() {
		return (
			<View className='index'>
				<ImageCropper imgSrc='https://dss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=1208128418,1540566224&fm=26&gp=0.jpg'></ImageCropper>
			</View>
		);
	}
}
