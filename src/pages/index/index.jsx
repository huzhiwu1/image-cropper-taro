import Taro, { Component } from "@tarojs/taro";
import { View, Button, Image } from "@tarojs/components";
import "./index.scss";
import ImageCropper from "../../components/ImageCropper";

export default class Index extends Component {
	constructor(props) {
		super(props);
		this.imageCropper = Taro.createRef();
		this.state = {
			previewUrl: null,
			originUrl: null,
		};
	}
	componentWillMount() {}

	componentDidMount() {}

	componentWillUnmount() {}

	componentDidShow() {}

	componentDidHide() {}

	config = {
		navigationBarTitleText: "首页",
	};
	async isAuthorize(authorize) {
		let authSetting = await Taro.getSetting();
		if (!authSetting[authorize]) {
			return new Promise((resolve, reject) => {
				Taro.authorize({
					scope: "scope.writePhotosAlbum",
					success() {
						resolve("yes");
					},
					fail() {
						reject();
					},
				});
			});
		}
		return Promise.resolve("yes");
	}
	async handleOk() {
		let isAuthSetting = await this.isAuthorize("scope.writePhotosAlbum");
		if (isAuthSetting === "yes") {
			let result = await this.imageCropper.current._getImg();
			console.log(result, "result");
			this.setState({
				previewUrl: result.tempFilePath,
			});
			// Taro.saveImageToPhotosAlbum({
			// 	filePath: result.tempFilePath,
			// 	success: function(res) {
			// 		Taro.showToast({
			// 			title: "保存图片成功",
			// 		});
			// 	},
			// 	fail() {
			// 		Taro.showToast({
			// 			title: "保存图片失败",
			// 			icon: "fail",
			// 		});
			// 	},
			// });
		}
	}
	handleSelectImg() {
		this.setState(
			{
				previewUrl: null,
				originUrl: null,
			},
			() => {
				Taro.chooseImage({
					count: 1, // 默认9
					sizeType: ["original", "compressed"], // 可以指定是原图还是压缩图，默认二者都有
					sourceType: ["album", "camera"], // 可以指定来源是相册还是相机，默认二者都有，在H5浏览器端支持使用 `user` 和 `environment`分别指定为前后摄像头
					success: (res) => {
						// 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
						var tempFilePaths = res.tempFilePaths;
						this.setState({
							originUrl: tempFilePaths[0],
						});
					},
				});
			}
		);
	}
	render() {
		const { previewUrl, originUrl } = this.state;
		return (
			<View className="index">
				{previewUrl && (
					<View className="img-wrapper">
						<Image
							src={previewUrl}
							mode="aspectFit"
							style={{ width: "100%", height: "100%" }}
						/>
					</View>
				)}
				<Button onClick={this.handleSelectImg}>选择图片</Button>

				{!previewUrl && originUrl && (
					<View>
						<ImageCropper
							imgSrc={originUrl}
							ref={this.imageCropper}
						></ImageCropper>
						<Button onClick={this.handleOk} className="confirm-btn">
							保存图片
						</Button>
					</View>
				)}
			</View>
		);
	}
}
