<GameFile>
  <PropertyGroup Name="ChooseRoomGUI" Type="Scene" ID="d0002ad4-dcf0-45cf-8c2a-ef9853d58a48" Version="3.10.0.0" />
  <Content ctype="GameProjectContent">
    <Content>
      <Animation Duration="0" Speed="1.0000" />
      <ObjectData Name="Scene" Tag="110" ctype="GameNodeObjectData">
        <Size X="1200.0000" Y="720.0000" />
        <Children>
          <AbstractNodeData Name="bg" Visible="False" ActionTag="-129565431" Tag="112" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="-180.0000" RightMargin="-180.0000" LeftEage="264" RightEage="264" TopEage="158" BottomEage="158" Scale9OriginX="264" Scale9OriginY="158" Scale9Width="1032" Scale9Height="404" ctype="ImageViewObjectData">
            <Size X="1560.0000" Y="720.0000" />
            <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
            <Position X="600.0000" Y="360.0000" />
            <Scale ScaleX="1.0000" ScaleY="1.0000" />
            <CColor A="255" R="255" G="255" B="255" />
            <PrePosition X="0.5000" Y="0.5000" />
            <PreSize X="1.3000" Y="1.0000" />
            <FileData Type="Normal" Path="Common/bgChooseRoom.jpg" Plist="" />
          </AbstractNodeData>
          <AbstractNodeData Name="pLeftTop" ActionTag="-550360262" UserData="scale" Tag="138" IconVisible="False" PercentHeightEnable="True" PercentHeightEnabled="True" HorizontalEdge="LeftEdge" VerticalEdge="TopEdge" RightMargin="400.0000" BottomMargin="557.2800" ClipAble="True" BackColorAlpha="102" ColorAngle="90.0000" Scale9Width="1" Scale9Height="1" ctype="PanelObjectData">
            <Size X="800.0000" Y="162.7200" />
            <Children>
              <AbstractNodeData Name="btnQuit" ActionTag="31274861" Tag="113" IconVisible="False" HorizontalEdge="LeftEdge" VerticalEdge="TopEdge" RightMargin="721.0000" TopMargin="10.0000" BottomMargin="90.7200" TouchEnable="True" FontSize="14" Scale9Enable="True" LeftEage="15" RightEage="15" TopEage="11" BottomEage="11" Scale9OriginX="15" Scale9OriginY="11" Scale9Width="49" Scale9Height="40" OutlineSize="0" ShadowOffsetX="0.0000" ShadowOffsetY="0.0000" ctype="ButtonObjectData">
                <Size X="79.0000" Y="62.0000" />
                <AnchorPoint ScaleY="0.5000" />
                <Position Y="121.7200" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition Y="0.7480" />
                <PreSize X="0.0988" Y="0.3810" />
                <TextColor A="255" R="65" G="65" B="70" />
                <DisabledFileData Type="Default" Path="Default/Button_Disable.png" Plist="" />
                <PressedFileData Type="Normal" Path="ChooseRoomGUI/btnBack.png" Plist="" />
                <NormalFileData Type="Normal" Path="ChooseRoomGUI/btnBack.png" Plist="" />
                <OutlineColor A="255" R="255" G="0" B="0" />
                <ShadowColor A="255" R="110" G="110" B="110" />
              </AbstractNodeData>
              <AbstractNodeData Name="title" ActionTag="1170761998" Tag="257" IconVisible="False" HorizontalEdge="LeftEdge" VerticalEdge="TopEdge" LeftMargin="100.0000" RightMargin="525.0000" TopMargin="23.0000" BottomMargin="100.7200" LeftEage="49" RightEage="49" TopEage="15" BottomEage="15" Scale9OriginX="49" Scale9OriginY="15" Scale9Width="77" Scale9Height="9" ctype="ImageViewObjectData">
                <Size X="175.0000" Y="39.0000" />
                <AnchorPoint ScaleY="0.5000" />
                <Position X="100.0000" Y="120.2200" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.1250" Y="0.7388" />
                <PreSize X="0.2188" Y="0.2397" />
                <FileData Type="Normal" Path="ChooseRoomGUI/titleChooseRoom.png" Plist="" />
              </AbstractNodeData>
              <AbstractNodeData Name="btn3" ActionTag="1569830721" Tag="121" IconVisible="False" HorizontalEdge="LeftEdge" VerticalEdge="BottomEdge" LeftMargin="570.0000" RightMargin="-6.0000" TopMargin="88.7200" BottomMargin="-74.0000" TouchEnable="True" FontSize="14" Scale9Enable="True" LeftEage="15" RightEage="15" TopEage="11" BottomEage="11" Scale9OriginX="15" Scale9OriginY="11" Scale9Width="206" Scale9Height="126" OutlineSize="0" ShadowOffsetX="0.0000" ShadowOffsetY="0.0000" ctype="ButtonObjectData">
                <Size X="236.0000" Y="148.0000" />
                <Children>
                  <AbstractNodeData Name="range" ActionTag="613239517" Tag="526" IconVisible="False" PositionPercentXEnabled="True" LeftMargin="9.5000" RightMargin="9.5000" TopMargin="39.6636" BottomMargin="81.3364" FontSize="20" LabelText="Text Label0000000000" HorizontalAlignmentType="HT_Center" VerticalAlignmentType="VT_Center" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="TextObjectData">
                    <Size X="217.0000" Y="27.0000" />
                    <AnchorPoint ScaleX="0.5000" ScaleY="1.0000" />
                    <Position X="118.0000" Y="108.3364" />
                    <Scale ScaleX="0.9600" ScaleY="1.0000" />
                    <CColor A="255" R="255" G="255" B="255" />
                    <PrePosition X="0.5000" Y="0.7320" />
                    <PreSize X="0.9195" Y="0.1824" />
                    <FontResource Type="Normal" Path="Font/tahomabd.ttf" Plist="" />
                    <OutlineColor A="255" R="255" G="0" B="0" />
                    <ShadowColor A="255" R="110" G="110" B="110" />
                  </AbstractNodeData>
                  <AbstractNodeData Name="select" ActionTag="-797528858" Tag="738" IconVisible="False" PositionPercentXEnabled="True" LeftMargin="55.0000" RightMargin="55.0000" TopMargin="14.0000" BottomMargin="100.0000" LeftEage="41" RightEage="41" TopEage="11" BottomEage="11" Scale9OriginX="41" Scale9OriginY="11" Scale9Width="44" Scale9Height="12" ctype="ImageViewObjectData">
                    <Size X="126.0000" Y="34.0000" />
                    <AnchorPoint ScaleX="0.5000" />
                    <Position X="118.0000" Y="100.0000" />
                    <Scale ScaleX="1.0000" ScaleY="1.0000" />
                    <CColor A="255" R="255" G="255" B="255" />
                    <PrePosition X="0.5000" Y="0.6757" />
                    <PreSize X="0.5339" Y="0.2297" />
                    <FileData Type="Normal" Path="ChooseRoomGUI/textChannel_0.png" Plist="" />
                  </AbstractNodeData>
                </Children>
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="688.0000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.8600" />
                <PreSize X="0.2950" Y="0.9095" />
                <TextColor A="255" R="229" G="229" B="229" />
                <DisabledFileData Type="Normal" Path="ChooseRoomGUI/btnChannelSelect.png" Plist="" />
                <PressedFileData Type="Normal" Path="ChooseRoomGUI/btnChannelSelect.png" Plist="" />
                <NormalFileData Type="Normal" Path="ChooseRoomGUI/btnChannel.png" Plist="" />
                <OutlineColor A="255" R="255" G="0" B="0" />
                <ShadowColor A="255" R="110" G="110" B="110" />
              </AbstractNodeData>
              <AbstractNodeData Name="btn2" ActionTag="-1391438433" Tag="125" IconVisible="False" HorizontalEdge="LeftEdge" VerticalEdge="BottomEdge" LeftMargin="380.0000" RightMargin="184.0000" TopMargin="88.7200" BottomMargin="-74.0000" TouchEnable="True" FontSize="14" Scale9Enable="True" LeftEage="15" RightEage="15" TopEage="11" BottomEage="11" Scale9OriginX="15" Scale9OriginY="11" Scale9Width="206" Scale9Height="126" OutlineSize="0" ShadowOffsetX="0.0000" ShadowOffsetY="0.0000" ctype="ButtonObjectData">
                <Size X="236.0000" Y="148.0000" />
                <Children>
                  <AbstractNodeData Name="range" ActionTag="-813893398" Tag="126" IconVisible="False" PositionPercentXEnabled="True" VerticalEdge="TopEdge" LeftMargin="9.5000" RightMargin="9.5000" TopMargin="39.6636" BottomMargin="81.3364" FontSize="20" LabelText="Text Label0000000000" HorizontalAlignmentType="HT_Center" VerticalAlignmentType="VT_Center" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="TextObjectData">
                    <Size X="217.0000" Y="27.0000" />
                    <AnchorPoint ScaleX="0.5000" ScaleY="1.0000" />
                    <Position X="118.0000" Y="108.3364" />
                    <Scale ScaleX="0.9600" ScaleY="1.0000" />
                    <CColor A="255" R="255" G="255" B="255" />
                    <PrePosition X="0.5000" Y="0.7320" />
                    <PreSize X="0.9195" Y="0.1824" />
                    <FontResource Type="Normal" Path="Font/tahomabd.ttf" Plist="" />
                    <OutlineColor A="255" R="255" G="0" B="0" />
                    <ShadowColor A="255" R="110" G="110" B="110" />
                  </AbstractNodeData>
                  <AbstractNodeData Name="select" ActionTag="966863061" Tag="127" IconVisible="False" PositionPercentXEnabled="True" VerticalEdge="TopEdge" LeftMargin="55.0000" RightMargin="55.0000" TopMargin="14.0000" BottomMargin="100.0000" LeftEage="41" RightEage="41" TopEage="11" BottomEage="11" Scale9OriginX="41" Scale9OriginY="11" Scale9Width="44" Scale9Height="12" ctype="ImageViewObjectData">
                    <Size X="126.0000" Y="34.0000" />
                    <AnchorPoint ScaleX="0.5000" />
                    <Position X="118.0000" Y="100.0000" />
                    <Scale ScaleX="1.0000" ScaleY="1.0000" />
                    <CColor A="255" R="255" G="255" B="255" />
                    <PrePosition X="0.5000" Y="0.6757" />
                    <PreSize X="0.5339" Y="0.2297" />
                    <FileData Type="Normal" Path="ChooseRoomGUI/textChannel_0.png" Plist="" />
                  </AbstractNodeData>
                </Children>
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="498.0000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.6225" />
                <PreSize X="0.2950" Y="0.9095" />
                <TextColor A="255" R="229" G="229" B="229" />
                <DisabledFileData Type="Normal" Path="ChooseRoomGUI/btnChannelSelect.png" Plist="" />
                <PressedFileData Type="Normal" Path="ChooseRoomGUI/btnChannelSelect.png" Plist="" />
                <NormalFileData Type="Normal" Path="ChooseRoomGUI/btnChannel.png" Plist="" />
                <OutlineColor A="255" R="255" G="0" B="0" />
                <ShadowColor A="255" R="110" G="110" B="110" />
              </AbstractNodeData>
              <AbstractNodeData Name="btn1" ActionTag="2043017485" Tag="128" IconVisible="False" HorizontalEdge="LeftEdge" VerticalEdge="BottomEdge" LeftMargin="190.0000" RightMargin="374.0000" TopMargin="88.7200" BottomMargin="-74.0000" TouchEnable="True" FontSize="14" Scale9Enable="True" LeftEage="15" RightEage="15" TopEage="11" BottomEage="11" Scale9OriginX="15" Scale9OriginY="11" Scale9Width="206" Scale9Height="126" OutlineSize="0" ShadowOffsetX="0.0000" ShadowOffsetY="0.0000" ctype="ButtonObjectData">
                <Size X="236.0000" Y="148.0000" />
                <Children>
                  <AbstractNodeData Name="range" ActionTag="-746153427" Tag="129" IconVisible="False" PositionPercentXEnabled="True" VerticalEdge="TopEdge" LeftMargin="9.5000" RightMargin="9.5000" TopMargin="39.6636" BottomMargin="81.3364" FontSize="20" LabelText="Text Label0000000000" HorizontalAlignmentType="HT_Center" VerticalAlignmentType="VT_Center" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="TextObjectData">
                    <Size X="217.0000" Y="27.0000" />
                    <AnchorPoint ScaleX="0.5000" ScaleY="1.0000" />
                    <Position X="118.0000" Y="108.3364" />
                    <Scale ScaleX="0.9600" ScaleY="1.0000" />
                    <CColor A="255" R="255" G="255" B="255" />
                    <PrePosition X="0.5000" Y="0.7320" />
                    <PreSize X="0.9195" Y="0.1824" />
                    <FontResource Type="Normal" Path="Font/tahomabd.ttf" Plist="" />
                    <OutlineColor A="255" R="255" G="0" B="0" />
                    <ShadowColor A="255" R="110" G="110" B="110" />
                  </AbstractNodeData>
                  <AbstractNodeData Name="select" ActionTag="1168173399" Tag="130" IconVisible="False" PositionPercentXEnabled="True" VerticalEdge="TopEdge" LeftMargin="55.0000" RightMargin="55.0000" TopMargin="14.0000" BottomMargin="100.0000" LeftEage="41" RightEage="41" TopEage="11" BottomEage="11" Scale9OriginX="41" Scale9OriginY="11" Scale9Width="44" Scale9Height="12" ctype="ImageViewObjectData">
                    <Size X="126.0000" Y="34.0000" />
                    <AnchorPoint ScaleX="0.5000" />
                    <Position X="118.0000" Y="100.0000" />
                    <Scale ScaleX="1.0000" ScaleY="1.0000" />
                    <CColor A="255" R="255" G="255" B="255" />
                    <PrePosition X="0.5000" Y="0.6757" />
                    <PreSize X="0.5339" Y="0.2297" />
                    <FileData Type="Normal" Path="ChooseRoomGUI/textChannel_0.png" Plist="" />
                  </AbstractNodeData>
                </Children>
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="308.0000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.3850" />
                <PreSize X="0.2950" Y="0.9095" />
                <TextColor A="255" R="229" G="229" B="229" />
                <DisabledFileData Type="Normal" Path="ChooseRoomGUI/btnChannelSelect.png" Plist="" />
                <PressedFileData Type="Normal" Path="ChooseRoomGUI/btnChannelSelect.png" Plist="" />
                <NormalFileData Type="Normal" Path="ChooseRoomGUI/btnChannel.png" Plist="" />
                <OutlineColor A="255" R="255" G="0" B="0" />
                <ShadowColor A="255" R="110" G="110" B="110" />
              </AbstractNodeData>
              <AbstractNodeData Name="btn0" ActionTag="1704407900" Tag="131" IconVisible="False" HorizontalEdge="LeftEdge" VerticalEdge="BottomEdge" RightMargin="564.0000" TopMargin="88.7200" BottomMargin="-74.0000" TouchEnable="True" FontSize="14" Scale9Enable="True" LeftEage="15" RightEage="15" TopEage="11" BottomEage="11" Scale9OriginX="15" Scale9OriginY="11" Scale9Width="206" Scale9Height="126" OutlineSize="0" ShadowOffsetX="0.0000" ShadowOffsetY="0.0000" ctype="ButtonObjectData">
                <Size X="236.0000" Y="148.0000" />
                <Children>
                  <AbstractNodeData Name="range" ActionTag="-372090479" Tag="132" IconVisible="False" PositionPercentXEnabled="True" VerticalEdge="TopEdge" LeftMargin="9.5000" RightMargin="9.5000" TopMargin="39.6636" BottomMargin="81.3364" FontSize="20" LabelText="Text Label0000000000" HorizontalAlignmentType="HT_Center" VerticalAlignmentType="VT_Center" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="TextObjectData">
                    <Size X="217.0000" Y="27.0000" />
                    <AnchorPoint ScaleX="0.5000" ScaleY="1.0000" />
                    <Position X="118.0000" Y="108.3364" />
                    <Scale ScaleX="0.9600" ScaleY="1.0000" />
                    <CColor A="255" R="255" G="255" B="255" />
                    <PrePosition X="0.5000" Y="0.7320" />
                    <PreSize X="0.9195" Y="0.1824" />
                    <FontResource Type="Normal" Path="Font/tahomabd.ttf" Plist="" />
                    <OutlineColor A="255" R="255" G="0" B="0" />
                    <ShadowColor A="255" R="110" G="110" B="110" />
                  </AbstractNodeData>
                  <AbstractNodeData Name="select" ActionTag="1333321281" Tag="133" IconVisible="False" PositionPercentXEnabled="True" VerticalEdge="TopEdge" LeftMargin="55.0000" RightMargin="55.0000" TopMargin="14.0000" BottomMargin="100.0000" LeftEage="41" RightEage="41" TopEage="11" BottomEage="11" Scale9OriginX="41" Scale9OriginY="11" Scale9Width="44" Scale9Height="12" ctype="ImageViewObjectData">
                    <Size X="126.0000" Y="34.0000" />
                    <AnchorPoint ScaleX="0.5000" />
                    <Position X="118.0000" Y="100.0000" />
                    <Scale ScaleX="1.0000" ScaleY="1.0000" />
                    <CColor A="255" R="255" G="255" B="255" />
                    <PrePosition X="0.5000" Y="0.6757" />
                    <PreSize X="0.5339" Y="0.2297" />
                    <FileData Type="Normal" Path="ChooseRoomGUI/textChannel_0.png" Plist="" />
                  </AbstractNodeData>
                </Children>
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="118.0000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.1475" />
                <PreSize X="0.2950" Y="0.9095" />
                <TextColor A="255" R="229" G="229" B="229" />
                <DisabledFileData Type="Normal" Path="ChooseRoomGUI/btnChannelSelect.png" Plist="" />
                <PressedFileData Type="Normal" Path="ChooseRoomGUI/btnChannelSelect.png" Plist="" />
                <NormalFileData Type="Normal" Path="ChooseRoomGUI/btnChannel.png" Plist="" />
                <OutlineColor A="255" R="255" G="0" B="0" />
                <ShadowColor A="255" R="110" G="110" B="110" />
              </AbstractNodeData>
            </Children>
            <AnchorPoint ScaleY="1.0000" />
            <Position Y="720.0000" />
            <Scale ScaleX="1.0000" ScaleY="1.0000" />
            <CColor A="255" R="255" G="255" B="255" />
            <PrePosition Y="1.0000" />
            <PreSize X="0.6667" Y="0.2260" />
            <SingleColor A="255" R="150" G="200" B="255" />
            <FirstColor A="255" R="150" G="200" B="255" />
            <EndColor A="255" R="255" G="255" B="255" />
            <ColorVector ScaleY="1.0000" />
          </AbstractNodeData>
          <AbstractNodeData Name="bgSlide" ActionTag="-607060875" Tag="744" IconVisible="False" PositionPercentYEnabled="True" PercentWidthEnable="True" PercentWidthEnabled="True" HorizontalEdge="BothEdge" LeftMargin="-0.7200" RightMargin="0.7200" TopMargin="162.2160" BottomMargin="482.7640" LeftEage="514" RightEage="514" TopEage="24" BottomEage="24" Scale9OriginX="514" Scale9OriginY="24" Scale9Width="172" Scale9Height="27" ctype="ImageViewObjectData">
            <Size X="1200.0000" Y="75.0200" />
            <AnchorPoint ScaleX="0.5000" ScaleY="1.0000" />
            <Position X="599.2800" Y="557.7840" />
            <Scale ScaleX="1.0000" ScaleY="1.0000" />
            <CColor A="255" R="255" G="255" B="255" />
            <PrePosition X="0.4994" Y="0.7747" />
            <PreSize X="1.0000" Y="0.1042" />
            <FileData Type="Normal" Path="Common/bgColumn.png" Plist="" />
          </AbstractNodeData>
          <AbstractNodeData Name="noroom" ActionTag="-825266722" UserData="scale" Tag="196" IconVisible="False" PositionPercentXEnabled="True" LeftMargin="339.2400" RightMargin="344.7600" TopMargin="387.7762" BottomMargin="299.2238" FontSize="24" LabelText="Hiện không có bàn chơi nào trong kênh này..." ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="TextObjectData">
            <Size X="516.0000" Y="33.0000" />
            <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
            <Position X="597.2400" Y="315.7238" />
            <Scale ScaleX="1.0000" ScaleY="1.0000" />
            <CColor A="255" R="203" G="204" B="206" />
            <PrePosition X="0.4977" Y="0.4385" />
            <PreSize X="0.4300" Y="0.0458" />
            <FontResource Type="Normal" Path="Font/tahoma.ttf" Plist="" />
            <OutlineColor A="255" R="255" G="0" B="0" />
            <ShadowColor A="255" R="110" G="110" B="110" />
          </AbstractNodeData>
          <AbstractNodeData Name="btnBan" ActionTag="1675236552" UserData="scale" Tag="123" IconVisible="False" PositionPercentYEnabled="True" HorizontalEdge="BothEdge" LeftMargin="41.4400" RightMargin="1058.5601" TopMargin="172.5680" BottomMargin="497.4320" TouchEnable="True" FontSize="22" ButtonText="Số bàn" Scale9Enable="True" LeftEage="9" RightEage="9" TopEage="4" BottomEage="4" Scale9OriginX="9" Scale9OriginY="4" Scale9Width="57" Scale9Height="22" OutlineSize="0" ShadowOffsetX="0.0000" ShadowOffsetY="0.0000" ctype="ButtonObjectData">
            <Size X="100.0000" Y="50.0000" />
            <Children>
              <AbstractNodeData Name="sort" ActionTag="1865650513" Tag="138" IconVisible="False" LeftMargin="99.1215" RightMargin="-12.1215" TopMargin="23.1937" BottomMargin="18.8063" ctype="SpriteObjectData">
                <Size X="13.0000" Y="8.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="105.6215" Y="22.8063" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="1.0562" Y="0.4561" />
                <PreSize X="0.1300" Y="0.1600" />
                <FileData Type="Normal" Path="ChooseRoomGUI/btnSort.png" Plist="" />
                <BlendFunc Src="770" Dst="771" />
              </AbstractNodeData>
            </Children>
            <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
            <Position X="91.4400" Y="522.4320" />
            <Scale ScaleX="1.0000" ScaleY="1.0000" />
            <CColor A="255" R="255" G="255" B="255" />
            <PrePosition X="0.0762" Y="0.7256" />
            <PreSize X="0.0833" Y="0.0694" />
            <FontResource Type="Normal" Path="Font/tahomabd.ttf" Plist="" />
            <TextColor A="255" R="112" G="120" B="166" />
            <DisabledFileData Type="Default" Path="Default/Button_Disable.png" Plist="" />
            <OutlineColor A="255" R="255" G="0" B="0" />
            <ShadowColor A="255" R="110" G="110" B="110" />
          </AbstractNodeData>
          <AbstractNodeData Name="btnMucCuoc" ActionTag="-927816985" UserData="scale" Tag="122" IconVisible="False" PositionPercentYEnabled="True" HorizontalEdge="BothEdge" LeftMargin="726.8800" RightMargin="361.1200" TopMargin="174.5840" BottomMargin="495.4160" TouchEnable="True" FontSize="22" ButtonText="Mức cược" Scale9Enable="True" LeftEage="15" RightEage="15" TopEage="8" BottomEage="8" Scale9OriginX="15" Scale9OriginY="8" Scale9Width="82" Scale9Height="14" OutlineSize="0" ShadowOffsetX="0.0000" ShadowOffsetY="0.0000" ctype="ButtonObjectData">
            <Size X="112.0000" Y="50.0000" />
            <Children>
              <AbstractNodeData Name="sort" ActionTag="1462455698" Tag="136" IconVisible="False" LeftMargin="118.8590" RightMargin="-19.8590" TopMargin="22.3156" BottomMargin="19.6844" ctype="SpriteObjectData">
                <Size X="13.0000" Y="8.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="125.3590" Y="23.6844" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="1.1193" Y="0.4737" />
                <PreSize X="0.1161" Y="0.1600" />
                <FileData Type="Normal" Path="ChooseRoomGUI/btnSort.png" Plist="" />
                <BlendFunc Src="770" Dst="771" />
              </AbstractNodeData>
            </Children>
            <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
            <Position X="782.8800" Y="520.4160" />
            <Scale ScaleX="1.0000" ScaleY="1.0000" />
            <CColor A="255" R="255" G="255" B="255" />
            <PrePosition X="0.6524" Y="0.7228" />
            <PreSize X="0.0933" Y="0.0694" />
            <FontResource Type="Normal" Path="Font/tahomabd.ttf" Plist="" />
            <TextColor A="255" R="112" G="120" B="166" />
            <DisabledFileData Type="Default" Path="Default/Button_Disable.png" Plist="" />
            <OutlineColor A="255" R="255" G="0" B="0" />
            <ShadowColor A="255" R="110" G="110" B="110" />
          </AbstractNodeData>
          <AbstractNodeData Name="btnSoNguoi" ActionTag="383760792" UserData="scale" Tag="125" IconVisible="False" PositionPercentYEnabled="True" HorizontalEdge="BothEdge" LeftMargin="1005.2800" RightMargin="94.7200" TopMargin="173.5760" BottomMargin="496.4240" TouchEnable="True" FontSize="22" ButtonText="Số người" Scale9Enable="True" LeftEage="15" RightEage="15" TopEage="9" BottomEage="9" Scale9OriginX="15" Scale9OriginY="9" Scale9Width="71" Scale9Height="12" OutlineSize="0" ShadowOffsetX="0.0000" ShadowOffsetY="0.0000" ctype="ButtonObjectData">
            <Size X="100.0000" Y="50.0000" />
            <Children>
              <AbstractNodeData Name="sort" ActionTag="-1919424522" Tag="137" IconVisible="False" LeftMargin="106.4087" RightMargin="-19.4087" TopMargin="22.7457" BottomMargin="19.2543" ctype="SpriteObjectData">
                <Size X="13.0000" Y="8.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="112.9087" Y="23.2543" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="1.1291" Y="0.4651" />
                <PreSize X="0.1300" Y="0.1600" />
                <FileData Type="Normal" Path="ChooseRoomGUI/btnSort.png" Plist="" />
                <BlendFunc Src="770" Dst="771" />
              </AbstractNodeData>
            </Children>
            <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
            <Position X="1055.2800" Y="521.4240" />
            <Scale ScaleX="1.0000" ScaleY="1.0000" />
            <CColor A="255" R="255" G="255" B="255" />
            <PrePosition X="0.8794" Y="0.7242" />
            <PreSize X="0.0833" Y="0.0694" />
            <FontResource Type="Normal" Path="Font/tahomabd.ttf" Plist="" />
            <TextColor A="255" R="112" G="120" B="166" />
            <DisabledFileData Type="Default" Path="Default/Button_Disable.png" Plist="" />
            <OutlineColor A="255" R="255" G="0" B="0" />
            <ShadowColor A="255" R="110" G="110" B="110" />
          </AbstractNodeData>
          <AbstractNodeData Name="btnTenBan" ActionTag="-114960851" Tag="106" IconVisible="False" PositionPercentYEnabled="True" HorizontalEdge="BothEdge" LeftMargin="268.8520" RightMargin="842.1480" TopMargin="181.9920" BottomMargin="508.0080" TouchEnable="True" FontSize="22" ButtonText="Tên bàn" Scale9Enable="True" LeftEage="15" RightEage="15" TopEage="11" BottomEage="11" Scale9OriginX="15" Scale9OriginY="11" Scale9Width="59" Scale9Height="8" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="ButtonObjectData">
            <Size X="89.0000" Y="30.0000" />
            <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
            <Position X="313.3520" Y="523.0080" />
            <Scale ScaleX="1.0000" ScaleY="1.0000" />
            <CColor A="255" R="255" G="255" B="255" />
            <PrePosition X="0.2611" Y="0.7264" />
            <PreSize X="0.0742" Y="0.0417" />
            <FontResource Type="Normal" Path="Font/tahomabd.ttf" Plist="" />
            <TextColor A="255" R="112" G="120" B="166" />
            <DisabledFileData Type="Default" Path="Default/Button_Disable.png" Plist="" />
            <OutlineColor A="255" R="255" G="0" B="0" />
            <ShadowColor A="255" R="110" G="110" B="110" />
          </AbstractNodeData>
          <AbstractNodeData Name="pRightTop" ActionTag="-496300758" UserData="scale" Tag="139" IconVisible="False" HorizontalEdge="RightEdge" VerticalEdge="TopEdge" LeftMargin="797.1140" RightMargin="2.8860" TopMargin="2.1417" BottomMargin="657.8583" ClipAble="False" BackColorAlpha="102" ColorAngle="90.0000" Scale9Width="1" Scale9Height="1" ctype="PanelObjectData">
            <Size X="400.0000" Y="60.0000" />
            <AnchorPoint ScaleX="1.0000" ScaleY="1.0000" />
            <Position X="1197.1140" Y="717.8583" />
            <Scale ScaleX="1.0000" ScaleY="1.0000" />
            <CColor A="255" R="255" G="255" B="255" />
            <PrePosition X="0.9976" Y="0.9970" />
            <PreSize X="0.3333" Y="0.0833" />
            <SingleColor A="255" R="150" G="200" B="255" />
            <FirstColor A="255" R="150" G="200" B="255" />
            <EndColor A="255" R="255" G="255" B="255" />
            <ColorVector ScaleY="1.0000" />
          </AbstractNodeData>
          <AbstractNodeData Name="bgBottom" ActionTag="2105730553" Tag="124" IconVisible="False" HorizontalEdge="RightEdge" VerticalEdge="BottomEdge" LeftMargin="677.6179" RightMargin="2.3821" TopMargin="592.0000" LeftEage="171" RightEage="171" TopEage="42" BottomEage="42" Scale9OriginX="171" Scale9OriginY="42" Scale9Width="178" Scale9Height="44" ctype="ImageViewObjectData">
            <Size X="520.0000" Y="128.0000" />
            <Children>
              <AbstractNodeData Name="btnChoingay" ActionTag="1601871585" Tag="115" IconVisible="False" PositionPercentYEnabled="True" HorizontalEdge="RightEdge" LeftMargin="313.5840" RightMargin="28.4160" TopMargin="38.5584" BottomMargin="15.4416" TouchEnable="True" FontSize="14" Scale9Enable="True" LeftEage="15" RightEage="15" TopEage="11" BottomEage="11" Scale9OriginX="15" Scale9OriginY="11" Scale9Width="148" Scale9Height="52" OutlineSize="0" ShadowOffsetX="0.0000" ShadowOffsetY="0.0000" ctype="ButtonObjectData">
                <Size X="178.0000" Y="74.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="402.5840" Y="52.4416" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.7742" Y="0.4097" />
                <PreSize X="0.3423" Y="0.5781" />
                <TextColor A="255" R="65" G="65" B="70" />
                <DisabledFileData Type="Default" Path="Default/Button_Disable.png" Plist="" />
                <PressedFileData Type="Normal" Path="ChooseRoomGUI/btnPlayNow.png" Plist="" />
                <NormalFileData Type="Normal" Path="ChooseRoomGUI/btnPlayNow.png" Plist="" />
                <OutlineColor A="255" R="255" G="0" B="0" />
                <ShadowColor A="255" R="110" G="110" B="110" />
              </AbstractNodeData>
              <AbstractNodeData Name="btnTaoban" ActionTag="1124216809" Tag="116" IconVisible="False" PositionPercentYEnabled="True" HorizontalEdge="RightEdge" LeftMargin="118.2186" RightMargin="223.7814" TopMargin="40.0048" BottomMargin="13.9952" TouchEnable="True" FontSize="14" Scale9Enable="True" LeftEage="15" RightEage="15" TopEage="11" BottomEage="11" Scale9OriginX="15" Scale9OriginY="11" Scale9Width="148" Scale9Height="52" OutlineSize="0" ShadowOffsetX="0.0000" ShadowOffsetY="0.0000" ctype="ButtonObjectData">
                <Size X="178.0000" Y="74.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="207.2186" Y="50.9952" />
                <Scale ScaleX="0.9500" ScaleY="0.9500" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.3985" Y="0.3984" />
                <PreSize X="0.3423" Y="0.5781" />
                <TextColor A="255" R="65" G="65" B="70" />
                <DisabledFileData Type="Default" Path="Default/Button_Disable.png" Plist="" />
                <PressedFileData Type="Normal" Path="ChooseRoomGUI/btnTaoban.png" Plist="" />
                <NormalFileData Type="Normal" Path="ChooseRoomGUI/btnTaoban.png" Plist="" />
                <OutlineColor A="255" R="255" G="0" B="0" />
                <ShadowColor A="255" R="110" G="110" B="110" />
              </AbstractNodeData>
              <AbstractNodeData Name="btnSolo" ActionTag="1510352687" Tag="52" IconVisible="False" LeftMargin="58.9397" RightMargin="415.0603" TopMargin="61.8785" BottomMargin="30.1215" TouchEnable="True" FontSize="14" ButtonText="Solo" Scale9Enable="True" LeftEage="15" RightEage="15" TopEage="11" BottomEage="11" Scale9OriginX="15" Scale9OriginY="11" Scale9Width="16" Scale9Height="14" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="ButtonObjectData">
                <Size X="46.0000" Y="36.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="81.9397" Y="48.1215" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.1576" Y="0.3759" />
                <PreSize X="0.0885" Y="0.2813" />
                <TextColor A="255" R="65" G="65" B="70" />
                <DisabledFileData Type="Default" Path="Default/Button_Disable.png" Plist="" />
                <PressedFileData Type="Default" Path="Default/Button_Press.png" Plist="" />
                <NormalFileData Type="Default" Path="Default/Button_Normal.png" Plist="" />
                <OutlineColor A="255" R="255" G="0" B="0" />
                <ShadowColor A="255" R="110" G="110" B="110" />
              </AbstractNodeData>
            </Children>
            <AnchorPoint ScaleX="1.0000" />
            <Position X="1197.6179" />
            <Scale ScaleX="1.0000" ScaleY="1.0000" />
            <CColor A="255" R="255" G="255" B="255" />
            <PrePosition X="0.9980" />
            <PreSize X="0.4333" Y="0.1778" />
            <FileData Type="Normal" Path="ChooseRoomGUI/bgBottom.png" Plist="" />
          </AbstractNodeData>
        </Children>
      </ObjectData>
    </Content>
  </Content>
</GameFile>