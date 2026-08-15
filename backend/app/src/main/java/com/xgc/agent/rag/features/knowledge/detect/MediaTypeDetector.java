package com.xgc.agent.rag.features.knowledge.detect;

import com.xgc.agent.framework.base.error.exception.WebAdminException;
import com.xgc.agent.rag.features.knowledge.error.KnowledgeErrorCode;
import org.apache.tika.detect.DefaultDetector;
import org.apache.tika.detect.Detector;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.metadata.TikaCoreProperties;
import org.apache.tika.mime.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Map;
import java.util.Set;

/**
 * 以 Tika 探测结果为 MIME 权威，不信客户端 Content-Type。
 *
 * <p>Markdown 几乎没有魔数，必须带上 OriginalFilename，否则会退化成 text/plain。
 * 入参用 {@link InputStream}：探测只读所需前缀，避免整文件 {@code byte[]}。
 * 别名归一后再对白名单校验，并推导 {@link DocumentFormat}。</p>
 */
@Component
public class MediaTypeDetector {

    /**
     * 历史/厂商别名 → 规范 MIME。白名单只认右侧规范值。
     */
    private static final Map<String, String> MIME_ALIASES = Map.ofEntries(
            Map.entry("text/x-markdown", "text/markdown"),
            Map.entry("text/x-web-markdown", "text/markdown"),
            Map.entry("application/x-pdf", "application/pdf"),
            Map.entry("application/acrobat", "application/pdf"),
            Map.entry("image/jpg", "image/jpeg"),
            Map.entry("image/pjpeg", "image/jpeg")
    );

    private static final Set<String> ALLOWED = Set.of(
            "text/plain",
            "text/markdown",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "image/png",
            "image/jpeg",
            "image/svg+xml"
    );

    private final Detector detector = new DefaultDetector();

    /**
     * @param content          内容流（探测只读头部；由调用方关闭；探测后勿再读同一实例）
     * @param originalFilename 原始文件名，可空
     * @return 规范 MIME + 业务格式
     */
    public DetectedMediaType detectAllowed(InputStream content, String originalFilename) {
        if (content == null) {
            throw new WebAdminException(KnowledgeErrorCode.FILE_TYPE_UNSUPPORTED);
        }
        Metadata metadata = new Metadata();
        if (StringUtils.hasText(originalFilename)) {
            metadata.set(TikaCoreProperties.RESOURCE_NAME_KEY, originalFilename);
        }
        try {
            // Detector 依赖 mark/reset；不支持时包一层缓冲，避免探测把流读穿后无法回退
            InputStream probe = content.markSupported() ? content : new BufferedInputStream(content);
            MediaType mediaType = detector.detect(probe, metadata);
            String normalized = normalize(mediaType);
            if (!ALLOWED.contains(normalized)) {
                throw new WebAdminException(KnowledgeErrorCode.FILE_TYPE_UNSUPPORTED);
            }
            return new DetectedMediaType(normalized, DocumentFormat.fromCanonicalMediaType(normalized));
        } catch (IOException ex) {
            throw new WebAdminException(
                    KnowledgeErrorCode.FILE_TYPE_UNSUPPORTED.message(),
                    ex,
                    KnowledgeErrorCode.FILE_TYPE_UNSUPPORTED);
        }
    }

    private static String normalize(MediaType mediaType) {
        if (mediaType == null) {
            return "";
        }
        String raw = mediaType.getBaseType().toString();
        return MIME_ALIASES.getOrDefault(raw, raw);
    }

    /**
     * 探测结果：规范 MIME 与业务格式一并给出，避免调用方再维护一份映射。
     */
    public record DetectedMediaType(String mediaType, DocumentFormat documentFormat) {
    }
}
