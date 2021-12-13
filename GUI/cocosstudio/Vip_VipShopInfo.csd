<GameFile>
  <PropertyGroup Name="Vip_VipShopInfo" Type="Layer" ID="59c82cc3-4529-4fe1-a4f8-034383bdd7db" Version="3.10.0.0" />
  <Content ctype="GameProjectContent">
    <Content>
      <Animation Duration="0" Speed="1.0000" />
      <ObjectData Name="Layer" Tag="175" ctype="GameLayerObjectData">
        <Size X="525.0000" Y="58.0000" />
        <Children>
          <AbstractNodeData Name="pVip" ActionTag="-2028041594" UserData="scale" Tag="176" IconVisible="False" HorizontalEdge="RightEdge" VerticalEdge="BottomEdge" LeftMargin="30.0000" TouchEnable="True" ClipAble="False" BackColorAlpha="0" ComboBoxIndex="1" ColorAngle="90.0000" Scale9Width="1" Scale9Height="1" ctype="PanelObjectData">
            <Size X="495.0000" Y="58.0000" />
            <Children>
              <AbstractNodeData Name="btnEnterVip" ActionTag="911633722" Tag="177" IconVisible="False" HorizontalEdge="RightEdge" VerticalEdge="BottomEdge" LeftMargin="349.5000" RightMargin="-5.5000" TopMargin="3.0000" BottomMargin="3.0000" TouchEnable="True" FontSize="14" Scale9Enable="True" LeftEage="15" RightEage="15" TopEage="11" BottomEage="11" Scale9OriginX="15" Scale9OriginY="11" Scale9Width="121" Scale9Height="30" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="ButtonObjectData">
                <Size X="151.0000" Y="52.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="425.0000" Y="29.0000" />
                <Scale ScaleX="0.9000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.8586" Y="0.5000" />
                <PreSize X="0.3051" Y="0.8966" />
                <TextColor A="255" R="65" G="65" B="70" />
                <NormalFileData Type="Normal" Path="GUIVipNew/btnEnterVip.png" Plist="" />
                <OutlineColor A="255" R="255" G="0" B="0" />
                <ShadowColor A="255" R="110" G="110" B="110" />
              </AbstractNodeData>
              <AbstractNodeData Name="bgProgress" ActionTag="-2015968409" Tag="178" IconVisible="False" LeftMargin="56.9997" RightMargin="168.0003" TopMargin="24.4998" BottomMargin="6.5002" LeftEage="105" RightEage="105" TopEage="8" BottomEage="8" Scale9OriginX="105" Scale9OriginY="8" Scale9Width="110" Scale9Height="11" ctype="ImageViewObjectData">
                <Size X="270.0000" Y="27.0000" />
                <Children>
                  <AbstractNodeData Name="progressVip" ActionTag="-2012387136" Tag="179" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="3.5000" RightMargin="3.5000" TopMargin="3.0000" BottomMargin="3.0000" ProgressInfo="54" ctype="LoadingBarObjectData">
                    <Size X="263.0000" Y="21.0000" />
                    <Children>
                      <AbstractNodeData Name="imgVpoint" ActionTag="703731235" Tag="180" IconVisible="False" PositionPercentYEnabled="True" HorizontalEdge="RightEdge" LeftMargin="237.5000" RightMargin="0.5000" TopMargin="-1.0000" BottomMargin="-1.0000" LeftEage="8" RightEage="8" TopEage="7" BottomEage="7" Scale9OriginX="8" Scale9OriginY="7" Scale9Width="9" Scale9Height="9" ctype="ImageViewObjectData">
                        <Size X="25.0000" Y="23.0000" />
                        <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                        <Position X="250.0000" Y="10.5000" />
                        <Scale ScaleX="0.9000" ScaleY="0.9000" />
                        <CColor A="255" R="255" G="255" B="255" />
                        <PrePosition X="0.9506" Y="0.5000" />
                        <PreSize X="0.0951" Y="1.0952" />
                        <FileData Type="Normal" Path="GUIVipNew/iconVpoint.png" Plist="" />
                      </AbstractNodeData>
                      <AbstractNodeData Name="txtProgress" ActionTag="1006454213" Tag="181" IconVisible="False" PositionPercentXEnabled="True" PositionPercentYEnabled="True" LeftMargin="6.5000" RightMargin="6.5000" TopMargin="-0.5000" BottomMargin="-0.5000" IsCustomSize="True" FontSize="15" LabelText="500 / 1000" HorizontalAlignmentType="HT_Center" OutlineEnabled="True" ShadowOffsetX="0.0000" ShadowOffsetY="-2.0000" ctype="TextObjectData">
                        <Size X="250.0000" Y="22.0000" />
                        <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                        <Position X="131.5000" Y="10.5000" />
                        <Scale ScaleX="1.0000" ScaleY="0.9300" />
                        <CColor A="255" R="255" G="255" B="255" />
                        <PrePosition X="0.5000" Y="0.5000" />
                        <PreSize X="0.9506" Y="1.0476" />
                        <FontResource Type="Normal" Path="Font/tahoma.ttf" Plist="" />
                        <OutlineColor A="255" R="187" G="99" B="187" />
                        <ShadowColor A="255" R="172" G="77" B="172" />
                      </AbstractNodeData>
                    </Children>
                    <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                    <Position X="135.0000" Y="13.5000" />
                    <Scale ScaleX="1.0000" ScaleY="1.0000" />
                    <CColor A="255" R="255" G="255" B="255" />
                    <PrePosition X="0.5000" Y="0.5000" />
                    <PreSize X="0.9741" Y="0.7778" />
                    <ImageFileData Type="Normal" Path="GUIVipNew/processVpoint.png" Plist="" />
                  </AbstractNodeData>
                </Children>
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="191.9997" Y="20.0002" />
                <Scale ScaleX="0.8400" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.3879" Y="0.3448" />
                <PreSize X="0.5455" Y="0.4655" />
                <FileData Type="Normal" Path="GUIVipNew/bg/bgProcessVipShop.png" Plist="" />
              </AbstractNodeData>
              <AbstractNodeData Name="iconNextVip" ActionTag="417296225" Tag="182" IconVisible="False" LeftMargin="315.4996" RightMargin="148.5004" TopMargin="14.5000" BottomMargin="6.5000" LeftEage="9" RightEage="9" TopEage="12" BottomEage="12" Scale9OriginX="9" Scale9OriginY="12" Scale9Width="13" Scale9Height="13" ctype="ImageViewObjectData">
                <Size X="31.0000" Y="37.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="330.9996" Y="25.0000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.6687" Y="0.4310" />
                <PreSize X="0.0626" Y="0.6379" />
                <FileData Type="Normal" Path="GUIVipNew/iconVip/iconVip2.png" Plist="" />
              </AbstractNodeData>
              <AbstractNodeData Name="iconCurVip" ActionTag="-1856002928" Tag="183" IconVisible="False" LeftMargin="39.4996" RightMargin="424.5004" TopMargin="14.5000" BottomMargin="6.5000" LeftEage="9" RightEage="9" TopEage="11" BottomEage="11" Scale9OriginX="9" Scale9OriginY="11" Scale9Width="13" Scale9Height="15" ctype="ImageViewObjectData">
                <Size X="31.0000" Y="37.0000" />
                <AnchorPoint ScaleX="0.5000" ScaleY="0.5000" />
                <Position X="54.9996" Y="25.0000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.1111" Y="0.4310" />
                <PreSize X="0.0626" Y="0.6379" />
                <FileData Type="Normal" Path="GUIVipNew/iconVip/iconVip1.png" Plist="" />
              </AbstractNodeData>
              <AbstractNodeData Name="txtVip1" ActionTag="-1319960800" Tag="184" IconVisible="False" LeftMargin="86.9989" RightMargin="320.0011" TopMargin="4.0000" BottomMargin="34.0000" IsCustomSize="True" FontSize="14" LabelText="Vip 10 còn:" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="TextObjectData">
                <Size X="88.0000" Y="20.0000" />
                <AnchorPoint ScaleY="0.5000" />
                <Position X="86.9989" Y="44.0000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="255" B="255" />
                <PrePosition X="0.1758" Y="0.7586" />
                <PreSize X="0.1778" Y="0.3448" />
                <FontResource Type="Normal" Path="Font/tahoma.ttf" Plist="" />
                <OutlineColor A="255" R="255" G="0" B="0" />
                <ShadowColor A="255" R="110" G="110" B="110" />
              </AbstractNodeData>
              <AbstractNodeData Name="txtRemainTime" ActionTag="-189633162" Tag="185" IconVisible="False" LeftMargin="163.9986" RightMargin="180.0014" TopMargin="4.0000" BottomMargin="34.0000" IsCustomSize="True" FontSize="14" LabelText="10" ShadowOffsetX="2.0000" ShadowOffsetY="-2.0000" ctype="TextObjectData">
                <Size X="151.0000" Y="20.0000" />
                <AnchorPoint ScaleY="0.5000" />
                <Position X="163.9986" Y="44.0000" />
                <Scale ScaleX="1.0000" ScaleY="1.0000" />
                <CColor A="255" R="255" G="216" B="99" />
                <PrePosition X="0.3313" Y="0.7586" />
                <PreSize X="0.3051" Y="0.3448" />
                <FontResource Type="Normal" Path="Font/tahomabd.ttf" Plist="" />
                <OutlineColor A="255" R="255" G="0" B="0" />
                <ShadowColor A="255" R="110" G="110" B="110" />
              </AbstractNodeData>
            </Children>
            <AnchorPoint ScaleX="1.0000" />
            <Position X="525.0000" />
            <Scale ScaleX="1.0000" ScaleY="1.0000" />
            <CColor A="255" R="255" G="255" B="255" />
            <PrePosition X="1.0000" />
            <PreSize X="0.9429" Y="1.0000" />
            <SingleColor A="255" R="150" G="200" B="255" />
            <FirstColor A="255" R="150" G="200" B="255" />
            <EndColor A="255" R="255" G="255" B="255" />
            <ColorVector ScaleY="1.0000" />
          </AbstractNodeData>
        </Children>
      </ObjectData>
    </Content>
  </Content>
</GameFile>