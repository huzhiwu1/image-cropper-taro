import Taro, { Component } from "@tarojs/taro";
import { View, Text, Button } from "@tarojs/components";
import "./index.scss";
import ImageCropper from "../../components/ImageCropper";

export default class Index extends Component {
	constructor(props) {
		super(props);
		this.imageCropper = Taro.createRef();
	}
	componentWillMount() {}

	componentDidMount() {}

	componentWillUnmount() {}

	componentDidShow() {}

	componentDidHide() {}

	config = {
		navigationBarTitleText: "首页",
	};
	handleOk() {
		this.imageCropper.current._draw();
	}
	async handleOutPut() {
		let result = await this.imageCropper.current._getImg();
		console.log(result, "result");
	}
	async handleOutPutSave() {
		let { tempFilePath } = await this.imageCropper.current._getImg();
		Taro.saveImageToPhotosAlbum({
			filePath: tempFilePath,
			success(res) {
				Taro.showToast({
					title: "保存图片成功",
				});
			},
		});
	}
	render() {
		return (
			<View className="index">
				<ImageCropper
					imgSrc="https://dss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=1208128418,1540566224&fm=26&gp=0.jpg"
					ref={this.imageCropper}
				></ImageCropper>
				<Button onClick={this.handleOk} className="confirm-btn">
					确定
				</Button>
				{/*
				<Button onClick={this.handleOutPut} className="confirm-btn a">
					输出
				</Button>
				<Button
					onClick={this.handleOutPutSave}
					className="confirm-btn b"
				>
					保存图片
				</Button> */}
			</View>
		);
	}
}
